const fs = require('fs');
const path = require('path');

// 1. Refactor contratos_fases_data.ts
const dataFilePath = path.join(__dirname, '../src/app/dashboard/fases/contratos_fases_data.ts');
let dataContent = fs.readFileSync(dataFilePath, 'utf8');

// Replace interfaces
dataContent = dataContent.replace(
  /export interface HospitalEntregaItem \{[\s\S]*?\}/,
  `export interface ProductoMatriz {
  codigo_producto: string
  nombre_producto: string
  entregas: EntregaItem[]
}

export interface HospitalEntregaItemMulti {
  nombre: string
  cantidades_por_producto: number[][] 
  fechaInstalacion?: string
  contacto?: string
  persona?: string
  horario?: string
}`
);

dataContent = dataContent.replace(
  /export interface MatrizEntregasData \{[\s\S]*?\}/,
  `export interface MatrizEntregasData {
  licitacion_ref: string
  objeto: string
  productos: ProductoMatriz[]
  hospitales: HospitalEntregaItemMulti[]
}`
);

// Update the mock data to use the new multi-product format
const oldMatrizRegex = /"matrizEntregas": \{[\s\S]*?"licitacion_ref"[^\}]*\}[\s\S]*?\]\s*\}/;
const newMatrizData = `"matrizEntregas": {
      "licitacion_ref": "REF. LICITACIÓN COMPETITIVA No. LC26DM0050",
      "objeto": "\\"SUMINISTRO DE LABORATORIO CLINICO PARA DIFERENTES CENTROS DE ATENCION DEL ISSS PARTE 2 NECESIDAD 2026\\"",
      "productos": [
        {
          "codigo_producto": "500100007",
          "nombre_producto": "Sangre oculta heces (rapid Test)",
          "entregas": [
            { "num": 1, "dias": 30, "fechaLimite": "31/8/2026", "fechaApp": "26/8/2026" },
            { "num": 2, "dias": 60, "fechaLimite": "30/9/2026", "fechaApp": "22/9/2026" },
            { "num": 3, "dias": 90, "fechaLimite": "30/10/2026", "fechaApp": "20/10/2026" },
            { "num": 4, "dias": 120, "fechaLimite": "29/11/2026", "fechaApp": "17/11/2026" }
          ]
        },
        {
          "codigo_producto": "500100017",
          "nombre_producto": "Prueba cuantitativa PCT",
          "entregas": [
            { "num": 1, "dias": 30, "fechaLimite": "31/8/2026", "fechaApp": "26/8/2026" },
            { "num": 2, "dias": 60, "fechaLimite": "30/9/2026", "fechaApp": "22/9/2026" },
            { "num": 3, "dias": 90, "fechaLimite": "30/10/2026", "fechaApp": "20/10/2026" },
            { "num": 4, "dias": 120, "fechaLimite": "29/11/2026", "fechaApp": "17/11/2026" }
          ]
        },
        {
          "codigo_producto": "500100027",
          "nombre_producto": "Prueba antidoping multidroga",
          "entregas": [
            { "num": 1, "dias": 30, "fechaLimite": "31/8/2026", "fechaApp": "26/8/2026" },
            { "num": 2, "dias": 60, "fechaLimite": "30/9/2026", "fechaApp": "22/9/2026" },
            { "num": 3, "dias": 90, "fechaLimite": "30/10/2026", "fechaApp": "20/10/2026" },
            { "num": 4, "dias": 120, "fechaLimite": "29/11/2026", "fechaApp": "17/11/2026" }
          ]
        }
      ],
      "hospitales": [
        {
          "nombre": "ISSS SANTA ANA",
          "cantidades_por_producto": [
            [550, 550, 550, 550],
            [120, 120, 120, 120],
            [60, 60, 60, 60]
          ]
        },
        {
          "nombre": "ISSS DE SONSONATE",
          "cantidades_por_producto": [
            [181, 181, 181, 182],
            [0, 0, 0, 0],
            [120, 120, 120, 120]
          ]
        },
        {
          "nombre": "ISSS SAN MIGUEL",
          "cantidades_por_producto": [
            [150, 150, 150, 150],
            [20, 20, 20, 20],
            [900, 900, 900, 900]
          ]
        },
        {
          "nombre": "ISSS ROMA",
          "cantidades_por_producto": [
            [10, 10, 10, 10],
            [0, 0, 0, 0],
            [11, 11, 11, 11]
          ]
        },
        {
          "nombre": "ISSS AMATEPEC",
          "cantidades_por_producto": [
            [80, 80, 80, 80],
            [200, 200, 200, 200],
            [60, 60, 60, 60]
          ]
        },
        {
          "nombre": "ISSS MQ",
          "cantidades_por_producto": [
            [213, 213, 213, 211],
            [840, 840, 840, 840],
            [520, 520, 520, 520]
          ]
        }
      ]
    }`;

dataContent = dataContent.replace(oldMatrizRegex, newMatrizData);
fs.writeFileSync(dataFilePath, dataContent, 'utf8');
console.log('Updated contratos_fases_data.ts');
