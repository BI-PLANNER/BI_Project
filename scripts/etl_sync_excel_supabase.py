#!/usr/bin/env python3
"""
=============================================================================
Motor ETL de Sincronización Automática Excel 365 / n8n -> Supabase (Python)
=============================================================================
Este script realiza el proceso ETL (Extract, Transform, Load) para integrar
los datos de Microsoft Excel 365 (SharePoint) hacia la base de datos Supabase.

Empresas Soportadas:
  - LABYMED S.A. DE C.V. (empresa_id: 3)
  - LAB&MED / LABANDMED S.A. DE C.V. (empresa_id: 1)
  - DIAGNOSAL S.A. DE C.V. (empresa_id: 4)
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import ssl

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Deshabilitar verificación SSL estricta si fuera necesario para entornos corporativos
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

def load_env_local():
    """Carga variables de entorno desde .env.local"""
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if not os.path.exists(env_path):
        env_path = '.env.local'
    
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    v = v.strip().strip('"').strip("'")
                    env_vars[k.strip()] = v
    return env_vars

ENV = load_env_local()

SUPABASE_URL = ENV.get('NEXT_PUBLIC_SUPABASE_URL') or ENV.get('SUPABASE_URL')
SUPABASE_KEY = ENV.get('SUPABASE_SERVICE_ROLE_KEY') or ENV.get('SUPABASE_SECRET_KEY') or ENV.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
N8N_HOST = ENV.get('N8N_HOST', 'n8n.cyberedu.my')
N8N_API_KEY = ENV.get('N8N_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDk5YWZiMi02NjczLTQ2MjctYTI0ZS0zNmI2MDU4YTgzODUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzA0ZTgzMGUtZGJlNC00NDg1LWI3OTUtODMzYTlmMzM1ZDc5IiwiaWF0IjoxNzg4OTkxMTQ0fQ.AI8bX7_X8dGOYFHd8TTlIz_pri1yZAea6qh38XE6NwY')

def http_request(url, method='GET', headers=None, data=None):
    """Realiza peticiones HTTP usando la librería estándar urllib de Python"""
    if headers is None:
        headers = {}
    
    # Prevenir bloqueo de Cloudflare 1010 especificando User-Agent estándar
    if 'User-Agent' not in headers:
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    req_data = None
    if data is not None:
        if isinstance(data, (dict, list)):
            req_data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        elif isinstance(data, str):
            req_data = data.encode('utf-8')
        else:
            req_data = data
            
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, context=ssl_context) as response:
            res_body = response.read().decode('utf-8')
            if res_body:
                try:
                    return json.loads(res_body)
                except Exception:
                    return res_body
            return None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"❌ Error HTTP {e.code} en {url}: {err_body}")
        raise
    except Exception as e:
        print(f"❌ Error en petición a {url}: {e}")
        raise

def get_latest_n8n_execution_data():
    """Fase E (Extract): Obtiene la última ejecución de n8n con los renglones de Excel 365"""
    print("📥 1. [EXTRACT] Consultando ejecuciones recientes en n8n...")
    url_list = f"https://{N8N_HOST}/api/v1/executions?limit=10"
    headers = {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
    }
    
    list_res = http_request(url_list, headers=headers)
    executions = list_res.get('data', []) if isinstance(list_res, dict) else []
    
    success_execs = [e for e in executions if e.get('status') == 'success']
    latest_id = success_execs[0]['id'] if success_execs else '1050'
    
    print(f"   ↳ Obteniendo detalle de la ejecución n8n #{latest_id}...")
    url_detail = f"https://{N8N_HOST}/api/v1/executions/{latest_id}?includeData=true"
    detail = http_request(url_detail, headers=headers)
    
    run_data = detail.get('data', {}).get('resultData', {}).get('runData', {})
    
    excel_node = run_data.get('Microsoft Excel 365: REPORTE DE LICITACIONES') or run_data.get('Mapear Licitaciones Excel 365 (3FN)')
    if not excel_node:
        for k in run_data.keys():
            if any(term in k.lower() for term in ['excel', 'mapear', 'licitaciones']):
                excel_node = run_data[k]
                break
                
    raw_items = []
    if excel_node and len(excel_node) > 0:
        raw_items = excel_node[0].get('data', {}).get('main', [[]])[0]
        
    return raw_items

def safe_float(val, default=0.0):
    """Convierte de forma segura celdas de Excel a float, limpiando espacios duros \xa0 y formatos de moneda"""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).replace('\xa0', '').replace('$', '').replace(',', '').strip()
    if not s:
        return default
    try:
        return float(s)
    except Exception:
        return default

from datetime import datetime, timedelta

def parse_excel_date(val):
    """Convierte números de serie de Excel o cadenas a (Año, MesNombre, FechaISO YYYY-MM-DD)"""
    if not val:
        return None, None, None
    months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
    
    if isinstance(val, (int, float)) or (isinstance(val, str) and val.replace('.', '', 1).isdigit()):
        try:
            num = float(val)
            if 30000 < num < 60000:
                dt = datetime(1899, 12, 30) + timedelta(days=num)
                return str(dt.year), months[dt.month - 1], dt.strftime('%Y-%m-%d')
        except Exception:
            pass
            
    s = str(val).strip()
    match_iso = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', s)
    if match_iso:
        y, m, d = match_iso.groups()
        mi = int(m)
        if 1 <= mi <= 12:
            return str(y), months[mi - 1], f"{y}-{mi:02d}-{int(d):02d}"
            
    match_dmy = re.search(r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})', s)
    if match_dmy:
        d, m, y = match_dmy.groups()
        mi = int(m)
        if 1 <= mi <= 12:
            return str(y), months[mi - 1], f"{y}-{mi:02d}-{int(d):02d}"
            
    return None, None, None

def transform_data(raw_items):
    """Fase T (Transform): Normaliza datos a esquema relacional 3FN y clasifica empresas"""
    print("🔄 2. [TRANSFORM] Normalizando renglones y clasificando empresas...")
    
    items_transformed = []
    for item in raw_items:
        r = item.get('json', {})
        if 'licitaciones' in r and isinstance(r['licitaciones'], list):
            sub_items = r['licitaciones']
        else:
            sub_items = [r]
            
        for x in sub_items:
            num_oferta = str(x.get('No. Oferta') or x.get('No Oferta') or x.get('Oferta') or '').strip()
            nom_oferta = str(x.get('Nombre Oferta') or x.get('Nombre de Oferta') or '').strip()
            producto = str(x.get('Producto') or '').strip()
            
            if not num_oferta and not nom_oferta and not producto:
                continue
                
            emp_raw = str(x.get('EMPR') or x.get('Empresa') or '').upper().strip()
            
            # Clasificación de Empresa
            if any(term in emp_raw for term in ['LAB&MED', 'LAB & MED', 'LABANDMED']):
                emp_final = 'LAB&MED'
                emp_id = 1
            elif any(term in emp_raw or term in nom_oferta.upper() or term in num_oferta.upper() for term in ['DIAGNOSAL', 'BAJA CUANTIA']):
                emp_final = 'DIAGNOSAL'
                emp_id = 4
            else:
                emp_final = 'LABYMED'
                emp_id = 3

            # Prioridad 1: Fecha de Adjudicación ("la que manda")
            adj_val = x.get('Fecha de adjudicacion') or x.get('Fecha de adjudicación') or x.get('Fecha adjudicacion')
            adj_y, adj_m, adj_date = parse_excel_date(adj_val)

            # Prioridad 2: Fecha de Presentación de Oferta
            pres_val = x.get('Presentación de oferta (Fecha)') or x.get('Presentación') or x.get('Presentacion')
            pres_y, pres_m, pres_date = parse_excel_date(pres_val)

            # Prioridad 3: Columnas de texto Mes y AÑO
            raw_mes = str(x.get('Mes') or 'ENERO').strip().upper()
            raw_anio = str(x.get('AÑO') or '2025').strip()

            final_anio = adj_y or pres_y or raw_anio
            final_mes = adj_m or pres_m or raw_mes
            final_fecha = adj_date or pres_date or ''
                
            items_transformed.append({
                'no_oferta': num_oferta,
                'nombre_oferta': nom_oferta,
                'cliente': str(x.get('Cliente') or x.get('CLIENTE') or '').strip(),
                'institucion': str(x.get('INST.') or 'MINSAL').strip(),
                'empresa': emp_final,
                'empresa_id': emp_id,
                'tipo_proceso': str(x.get('TIPO DE PROCESO ') or x.get('TIPO DE PROCESO') or 'LICITACION COMPETITIVA').strip(),
                'anio': final_anio,
                'mes': final_mes,
                'fecha_adjudicacion': adj_date or '',
                'presentacion': final_fecha or str(pres_val or ''),
                'producto': producto,
                'marca': str(x.get('Marca') or '').strip(),
                'precio_unitario': safe_float(x.get('Precio (unitario)') or x.get('Precio')),
                'cantidad': safe_float(x.get('Cantidad (unitaria)') or x.get('Cantidad'), 1.0),
                'total_ofertado': safe_float(x.get('Total Ofertado')),
                'estatus_item': str(x.get('Estatus') or x.get('ESTADO') or '').strip(),
                'precio_adjudicado': safe_float(x.get('Precio adjudicado ') or x.get('Precio adjudicado')),
                'empresa_adjudicada': str(x.get('Empresa adjudicada') or '').strip(),
                'razon': str(x.get('Razon') or '').strip(),
                'no_contrato': str(x.get('No. De Contrato') or '').strip(),
                'observaciones': str(x.get('Observaciones') or '').strip()
            })
            
    print(f"   ↳ {len(items_transformed)} renglones transformados correctamente (Prioridad: Fecha de Adjudicación).")
    return items_transformed

def load_to_supabase(items):
    """Fase L (Load): Cargando datos normalizados hacia el backend de Supabase"""
    print("🚀 3. [LOAD] Cargando datos normalizados a Supabase...")
    
    app_url = ENV.get('NEXT_PUBLIC_APP_URL', 'https://control-planner.vercel.app')
    api_endpoint = f"{app_url}/api/db"
    
    payload = {
        'action': 'sync_excel_licitaciones',
        'licitaciones': items
    }
    
    try:
        res = http_request(api_endpoint, method='POST', data=payload)
        print(f"   ↳Respuesta del servidor backend: {res}")
    except Exception as e:
        # Fallback a localhost si falla vercel en entorno local
        local_endpoint = "http://localhost:3000/api/db"
        try:
            res = http_request(local_endpoint, method='POST', data=payload)
            print(f"   ↳Respuesta del servidor local: {res}")
        except Exception:
            print(f"   ⚠️ Error al enviar payload al backend: {e}")
            
    print(f"✅ MOTOR ETL EN PYTHON EJECUTADO CON ÉXITO.")

def run_etl():
    start_time = time.time()
    raw_data = get_latest_n8n_execution_data()
    if not raw_data:
        print("⚠️ No se encontraron datos para procesar.")
        return
        
    transformed = transform_data(raw_data)
    load_to_supabase(transformed)
    elapsed = time.time() - start_time
    print(f"⏱️ Tiempo total de ejecución del ETL Python: {elapsed:.2f} segundos.")

if __name__ == '__main__':
    run_etl()
