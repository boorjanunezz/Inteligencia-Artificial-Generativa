import os
import uuid
import pdfplumber
import docx
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SimpleField,
    SearchFieldDataType,
    SearchableField,
    SearchField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SemanticConfiguration,
    SemanticPrioritizedFields,
    SemanticField,
    SemanticSearch,
    VectorSearchAlgorithmMetric
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from azure.search.documents.models import VectorizedQuery

load_dotenv()

AOAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AOAI_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AOAI_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
AOAI_DEPLOYMENT_CHAT = os.getenv("AZURE_OPENAI_DEPLOYMENT_CHAT", "gpt-4o")
AOAI_DEPLOYMENT_EMBED = os.getenv("AZURE_OPENAI_DEPLOYMENT_EMBEDDING", "text-embedding-ada-002")

SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY = os.getenv("AZURE_SEARCH_API_KEY")
SEARCH_INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "rag-assistants-index")

aoai_client = None
if AOAI_KEY and AOAI_ENDPOINT:
    aoai_client = AzureOpenAI(
        api_key=AOAI_KEY,
        api_version=AOAI_VERSION,
        azure_endpoint=AOAI_ENDPOINT
    )

def get_embeddings(text: str):
    response = aoai_client.embeddings.create(input=[text], model=AOAI_DEPLOYMENT_EMBED)
    return response.data[0].embedding

def setup_search_index():
    if not SEARCH_ENDPOINT or not SEARCH_KEY:
        print("Faltan credenciales de Azure Search. No se ha podido inicializar el índice.")
        return
    
    credential = AzureKeyCredential(SEARCH_KEY)
    index_client = SearchIndexClient(endpoint=SEARCH_ENDPOINT, credential=credential)
    
    try:
        index_client.get_index(SEARCH_INDEX_NAME)
        print("Índice de Azure Search encontrado.")
        return
    except Exception as e:
        print("Creando índice de Azure Search...")
        pass

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name="assistant_id", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="document_id", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="content", type=SearchFieldDataType.String, analyzer_name="es.microsoft"),
        SearchField(name="content_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single), searchable=True, vector_search_dimensions=1536, vector_search_profile_name="myHnswProfile")
    ]

    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(
                name="myHnsw",
                parameters={
                    "m": 4,
                    "efConstruction": 400,
                    "efSearch": 500,
                    "metric": VectorSearchAlgorithmMetric.COSINE
                }
            )
        ],
        profiles=[
            VectorSearchProfile(
                name="myHnswProfile",
                algorithm_configuration_name="myHnsw"
            )
        ]
    )

    index = SearchIndex(
        name=SEARCH_INDEX_NAME,
        fields=fields,
        vector_search=vector_search
    )

    index_client.create_index(index)
    print("Índice creado exitosamente.")

def extract_text_from_file(file_path: str, mimetype: str) -> str:
    text = ""
    if "pdf" in mimetype:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    elif "wordprocessingml" in mimetype or "docx" in mimetype:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    return text

def process_and_upload_document(assistant_id: int, document_id: int, file_path: str, mimetype: str):
    text = extract_text_from_file(file_path, mimetype)
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)
    
    credential = AzureKeyCredential(SEARCH_KEY)
    search_client = SearchClient(endpoint=SEARCH_ENDPOINT, index_name=SEARCH_INDEX_NAME, credential=credential)
    
    docs_to_upload = []
    for i, chunk in enumerate(chunks):
        docs_to_upload.append({
            "id": f"d{document_id}c{i}u{uuid.uuid4().hex[:8]}",
            "assistant_id": str(assistant_id),
            "document_id": str(document_id),
            "content": chunk,
            "content_vector": get_embeddings(chunk)
        })
        
        if len(docs_to_upload) >= 50:
            search_client.upload_documents(documents=docs_to_upload)
            docs_to_upload = []
            
    if docs_to_upload:
        search_client.upload_documents(documents=docs_to_upload)

def delete_document_from_index(document_id: int):
    # Obtener IDs de documento en el índice para este document_id y eliminarlos
    credential = AzureKeyCredential(SEARCH_KEY)
    search_client = SearchClient(endpoint=SEARCH_ENDPOINT, index_name=SEARCH_INDEX_NAME, credential=credential)
    results = search_client.search(search_text="*", filter=f"document_id eq '{document_id}'", select=["id"])
    docs_to_delete = [{"id": r["id"]} for r in results]
    if docs_to_delete:
        search_client.delete_documents(documents=docs_to_delete)

def rag_chat(assistant_id: int, system_prompt: str, chat_history: list, new_message: str) -> dict:
    query_vector = get_embeddings(new_message)
    
    credential = AzureKeyCredential(SEARCH_KEY)
    search_client = SearchClient(endpoint=SEARCH_ENDPOINT, index_name=SEARCH_INDEX_NAME, credential=credential)
    
    results = search_client.search(
        search_text=new_message,
        vector_queries=[VectorizedQuery(
            vector=query_vector,
            k_nearest_neighbors=5,
            fields="content_vector"
        )],
        filter=f"assistant_id eq '{assistant_id}'",
        select=["content", "document_id"],
        top=5
    )
    
    context_chunks = []
    for doc in results:
        context_chunks.append(f"[Ref Doc ID {doc['document_id']}]: {doc['content']}")
        
    context_str = "\n\n".join(context_chunks)
    
    if not context_str:
        context_str = "No se encontraron documentos relevantes."
        
    final_system_prompt = f"{system_prompt}\n\nIMPORTANTE: Eres un asistente que pertenece a esta aplicación RAG. Responde a la pregunta del usuario utilizando ÚNICAMENTE la siguiente información extraída de tus documentos.\nSi la información necesaria no se encuentra en el contexto, indica explícitamente que no puedes contestar basándote en la información disponible, NO te inventes datos. Si utilizas información del contexto, incluye una cita al final con el formato [Ref Doc ID X].\n\nCONTEXTO RECUPERADO:\n{context_str}"
    
    messages = [{"role": "system", "content": final_system_prompt}]
    
    for msg in chat_history:
        messages.append({"role": msg.role, "content": msg.content})
        
    messages.append({"role": "user", "content": new_message})
    
    response = aoai_client.chat.completions.create(
        model=AOAI_DEPLOYMENT_CHAT,
        messages=messages,
        temperature=0.3
    )
    
    return {
        "text": response.choices[0].message.content,
        "context_used": context_chunks
    }
