export interface EntregaItem {
  num: number
  dias: number
  fechaLimite: string
  fechaApp: string
}

export interface HospitalEntregaItem {
  nombre: string
  cantidades: number[]
  total: number
  fechaInstalacion: string
  contacto: string
  persona: string
  horario: string
}

export interface MatrizEntregasData {
  licitacion_ref: string
  objeto: string
  codigo_producto: string
  nombre_producto: string
  entregas: EntregaItem[]
  hospitales: HospitalEntregaItem[]
}

export interface ContratoFilaItem {
  id: string
  seccion: string
  numeral: string
  proceso: string
  ejecucion: string
  ejecutado: boolean
  comentario?: string
  comentarioColor?: 'yellow' | 'blue' | 'none'
}

export interface ContratoFaseData {
  id: string
  titulo: string
  contrato_num: string
  cliente: string
  filas: ContratoFilaItem[]
  matrizEntregas?: MatrizEntregasData
}

export const CONTRATOS_FASES_INICIALES: ContratoFaseData[] = [
  {
    "id": "isss-eritro",
    "titulo": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
    "contrato_num": "SM-022/2024",
    "cliente": "Instituto Salvadoreño del Seguro Social (ISSS)",
    "filas": [
      {
        "id": "isss-eritro-1",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.32",
        "proceso": "FACTURACIÓN",
        "ejecucion": "DENNIS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-2",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.22",
        "proceso": "CONTROLES (CARTA EXPLICATICA)",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-3",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.26",
        "proceso": "CONTROLES CADUCIDAD",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-4",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.27",
        "proceso": "ESPECIFICACIOENS DE LOS CONTROLES",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-5",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.3",
        "proceso": "CAPACIDAD DE EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-6",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.31",
        "proceso": "CAPACIDAD DE EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-7",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.33",
        "proceso": "FUNDAMENTO DE LA PRUEBA",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-8",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.34",
        "proceso": "CAPACIDAD DE EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-9",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.35",
        "proceso": "CAPACIDAD DE EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-10",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.36",
        "proceso": "VENCIMIENTO DEL REACTIVO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-11",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.28",
        "proceso": "ABASTESIMIENTO DE INSUMOS",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-12",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.39",
        "proceso": "ENTREGA DE REACTIVOS",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-13",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1",
        "proceso": "PEDIDO DEL  PRODUCTO",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-14",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.2",
        "proceso": "LABORATORIOS TEMPORALES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-15",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.23",
        "proceso": "ACTUALIZACION DEL PLAN DE CONTIGENCIA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-16",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.29",
        "proceso": "CHARLAS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-17",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.21",
        "proceso": "LABORATORIOS TEMPORALES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-18",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "2",
        "proceso": "IMPORTACION",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-19",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.7",
        "proceso": "GARANTIA DEL FABRICANTE",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-20",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.13",
        "proceso": "CUMPLIMIENTO DE MANTENIMIENTO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-21",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.12",
        "proceso": "CALENDARIZACION MANTENIMIENTO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-22",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.14",
        "proceso": "VERIFICACION DE UPS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-23",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.17",
        "proceso": "NUMERO LOCALES FIJOS 24/7",
        "ejecucion": "LUIS / MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-24",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.18",
        "proceso": "RESPUESTA OPORTUNIDA  4 HORAS MAX",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-25",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.19",
        "proceso": "PLAN CONTINGENCIA",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-26",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.24",
        "proceso": "BITACORAS DE MANTENIMIENTO F.18",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-27",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.25",
        "proceso": "BITACORAS DE MANTENIMIENTO F.18",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-28",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.15",
        "proceso": "IMPRESIÓN DE RESULTADOS",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-29",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.4",
        "proceso": "INTERCONEXION",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-30",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.41",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "ANTIVIRUS",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-31",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.42",
        "proceso": "SOFTWARE",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-32",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.43",
        "proceso": "DATOS DEL HARDWARE Y SOFTWARE",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-33",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.44",
        "proceso": "AVALACION DE INSTALACION",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "Pendiente confirmacion de la lic",
        "comentarioColor": "yellow"
      },
      {
        "id": "isss-eritro-34",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.45",
        "proceso": "CONTACTO TECNICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-35",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.8",
        "proceso": "DOCs. TECNIOS",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-36",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.1",
        "proceso": "FORMULARIO 17",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-37",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.16",
        "proceso": "ACREDITACION DEL PERSONAL",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-38",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "1.37",
        "proceso": "CUMPLIMIENTO CON ADMON DE CONTR.",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-39",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "QUINTA",
        "proceso": "GARANTIA",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "Cumplimiento de contrato",
        "comentarioColor": "none"
      },
      {
        "id": "isss-eritro-40",
        "seccion": "CONTRATO ISSS  -  CONTRATO NÚMERO SM-022/2024",
        "numeral": "SEXTA",
        "proceso": "RECUPERACION DE COBROS",
        "ejecucion": "VANESA",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      }
    ]
  },
  {
    "id": "isss-probnp",
    "titulo": "INSTITUTO SALVADOREÑO DEL SEGURO SOCIAL - REF. LICITACIÓN COMPETITIVA No. LC26DM0050",
    "contrato_num": "LC26DM0050",
    "cliente": "Instituto Salvadoreño del Seguro Social (ISSS)",
    "filas": [
      {
        "id": "isss-probnp-1",
        "seccion": "CALENDARIZACIÓN Y DOCUMENTACIÓN",
        "numeral": "1",
        "proceso": "CALENDARIZACION DE ENTREGA",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-probnp-2",
        "seccion": "CALENDARIZACIÓN Y DOCUMENTACIÓN",
        "numeral": "2",
        "proceso": "ENTREGA DE REACTIVO",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-probnp-3",
        "seccion": "CALENDARIZACIÓN Y DOCUMENTACIÓN",
        "numeral": "3",
        "proceso": "CONDICIONES DE ENTREGA (CADENA DE FRÍO)",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-probnp-4",
        "seccion": "CALENDARIZACIÓN Y DOCUMENTACIÓN",
        "numeral": "4",
        "proceso": "IMPORTACIÓN DE LOTES",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isss-probnp-5",
        "seccion": "CALENDARIZACIÓN Y DOCUMENTACIÓN",
        "numeral": "5",
        "proceso": "GESTIÓN CON CASA MATRIZ",
        "ejecucion": "JUAN JOSE (PM)",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      }
    ],
    "matrizEntregas": {
      "licitacion_ref": "REF. LICITACIÓN COMPETITIVA No. LC26DM0050",
      "objeto": "\"SUMINISTRO DE LABORATORIO CLINICO PARA DIFERENTES CENTROS DE ATENCION DEL ISSS PARTE 2 NECESIDAD 2026\"",
      "codigo_producto": "500100026",
      "nombre_producto": "PRUEBA PARA DETECCIÓN DE Pro-BNP",
      "entregas": [
        { "num": 1, "dias": 30, "fechaLimite": "31/8/2026", "fechaApp": "26/8/2026" },
        { "num": 2, "dias": 60, "fechaLimite": "30/9/2026", "fechaApp": "22/9/2026" },
        { "num": 3, "dias": 90, "fechaLimite": "30/10/2026", "fechaApp": "20/10/2026" },
        { "num": 4, "dias": 120, "fechaLimite": "29/11/2026", "fechaApp": "17/11/2026" },
        { "num": 5, "dias": 150, "fechaLimite": "29/12/2026", "fechaApp": "1/12/2026" }
      ],
      "hospitales": [
        {
          "nombre": "HOSP. REG. STA ANA",
          "cantidades": [134, 134, 134, 134, 134],
          "total": 670,
          "fechaInstalacion": "27/8/2026",
          "contacto": "7829-7884",
          "persona": "Lic Roxana",
          "horario": "9:00 a. m. JUEVES"
        },
        {
          "nombre": "HOSP. REG. SONSONATE",
          "cantidades": [10, 10, 10, 10, 10],
          "total": 50,
          "fechaInstalacion": "27/8/2026",
          "contacto": "7987-1756",
          "persona": "Lic. Rosa",
          "horario": "11:00 a. m. (correo de reprogramacion)"
        },
        {
          "nombre": "HOSP. AMATEPEC",
          "cantidades": [42, 42, 42, 42, 42],
          "total": 210,
          "fechaInstalacion": "20/8/2026",
          "contacto": "2591-5751",
          "persona": "Lic Leiva",
          "horario": "Normal"
        },
        {
          "nombre": "HOSP. MQ",
          "cantidades": [130, 130, 130, 130, 130],
          "total": 650,
          "fechaInstalacion": "26/8/2026",
          "contacto": "7129-2293",
          "persona": "Lic. Huezo",
          "horario": "01:30 area de emergencia"
        },
        {
          "nombre": "HOSP. GENERAL",
          "cantidades": [130, 130, 130, 130, 130],
          "total": 650,
          "fechaInstalacion": "19/8/2026",
          "contacto": "7180-1820",
          "persona": "Lic. Dora",
          "horario": "MIERCOLES 10:30 a. m."
        },
        {
          "nombre": "HOSP. POL. ZACAMIL",
          "cantidades": [50, 50, 50, 50, 50],
          "total": 250,
          "fechaInstalacion": "26/8/2026",
          "contacto": "7160-4961",
          "persona": "Lic. Morales",
          "horario": "Solo entregar producto"
        }
      ]
    }
  },
  {
    "id": "sta-ana",
    "titulo": "CONTRATO SAN JUAN DE DIOS DE SANTA ANA - CT No 16/2026",
    "contrato_num": "CT No 16/2026",
    "cliente": "Hospital San Juan de Dios de Santa Ana",
    "filas": [
      {
        "id": "sta-ana-1",
        "seccion": "7",
        "numeral": "1",
        "proceso": "PEDIDO DEL  PRODUCTO",
        "ejecucion": "J. JOSE. / JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-2",
        "seccion": "7",
        "numeral": "2",
        "proceso": "CONTROLES Y CONSUMIBLES",
        "ejecucion": "J. JOSE. / JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-3",
        "seccion": "7",
        "numeral": "3",
        "proceso": "IMPORTACION",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-4",
        "seccion": "7",
        "numeral": "6",
        "proceso": "TRAMITES ADMINISTRATIVOS",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-5",
        "seccion": "7",
        "numeral": "4",
        "proceso": "GARANTIA (FIANZA Y PAGARE)",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-6",
        "seccion": "7",
        "numeral": "5",
        "proceso": "RECUPERACION DE COBROS",
        "ejecucion": "VANESA",
        "ejecutado": true,
        "comentario": "Cobros",
        "comentarioColor": "blue"
      },
      {
        "id": "sta-ana-7",
        "seccion": "7",
        "numeral": "8",
        "proceso": "LINEAS TELEFONICAS",
        "ejecucion": "ROBERTO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-8",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.2",
        "proceso": "HOJA DE SEGURIDAD",
        "ejecucion": "ANDREA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-9",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.2",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-10",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.4",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-11",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.9",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-12",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.3",
        "proceso": "FIRMA DE RESULTADOS",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-13",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.31",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-14",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.33",
        "proceso": "ENTRENAMIENTO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-15",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.13",
        "proceso": "ABASTESIMIENTO DE INSUMOS",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-16",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.8",
        "proceso": "SILLA ERGONOMICA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-17",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.12",
        "proceso": "CONTROL DE CALIDAD INTERNOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-18",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.15",
        "proceso": "INSCRIPCION DE CONTROL DE CALIDAD",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "Pendiente entrega del fabricante - final de Agosto",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-19",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.16",
        "proceso": "CERTIFICADO DE PARTICIPACIÓN",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "Entregar al final del año 2026",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-20",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.19",
        "proceso": "ENTREGA DE MANUALES",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-21",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.23",
        "proceso": "ALMACENAMIENTO CLIMATIZADO (NEVERA)",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-22",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.25",
        "proceso": "PLAN DE CONTIGENCIA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-23",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.1",
        "proceso": "VIDA ULTIL DEL REACTIVO - 10 MESES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-24",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.3",
        "proceso": "CERTIFICADO DE MANUFACTURA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-25",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.14",
        "proceso": "CALIBRADORES Y CONTROLES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-26",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.22",
        "proceso": "SISTEMA DE AGUA",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-27",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.22.1",
        "proceso": "ROTO MOTOR (ROTOPLAS)",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "PENDIENTE COMPRA",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-28",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.26",
        "proceso": "REACTIVOS DE LA MISMA MARCA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-29",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.27",
        "proceso": "VOLUMENES MUERTOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-30",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.28",
        "proceso": "LABORATORIOS ALTERNOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-31",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.7",
        "proceso": "CENTRIFUGA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-32",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.11",
        "proceso": "IMPRESORA LÁSER",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-33",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.17",
        "proceso": "REMODELACION Y ADECUACION",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-34",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.18",
        "proceso": "MANTENIMIENTOS CORRECTIVO Y PREVENTIVO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-35",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.21",
        "proceso": "REPORTE DE DESECHOS TRIMESTRAL",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-36",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.29",
        "proceso": "RESPUESTA DE FALLA DE EQUIPOS",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-37",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.32",
        "proceso": "INSTALACIÓN DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-38",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.34",
        "proceso": "INFORME TRIMESTRAL",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "Reporta toca el 25-8-26 trimestral",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-39",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.5",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-40",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.6",
        "proceso": "SOFTWARE",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-41",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.1",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-42",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA EMERGENCIA) Atellica CI Marca: Siemens",
        "numeral": "1.24",
        "proceso": "INTERFAS DE SISTEMA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-43",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.19",
        "proceso": "HOJA DE SEGURIDAD",
        "ejecucion": "ANDREA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-44",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.2",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-45",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.4",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-46",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.9",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-47",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.29",
        "proceso": "FIRMA DE RESULTADOS",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-48",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.3",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-49",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.32",
        "proceso": "ENTRENAMIENTO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-50",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.13",
        "proceso": "ABASTESIMIENTO DE INSUMOS",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-51",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.8",
        "proceso": "SILLA ERGONOMICA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-52",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.12",
        "proceso": "CONTROL DE CALIDAD INTERNOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-53",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.15",
        "proceso": "INSCRIPCION DE CONTROL DE CALIDAD",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "Pendiente entrega del fabricante - final de Agosto",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-54",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.18",
        "proceso": "ENTREGA DE MANUALES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-55",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.22",
        "proceso": "ALMACENAMIENTO CLIMATIZADO (NEVERA)",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-56",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.24",
        "proceso": "PLAN DE CONTIGENCIA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-57",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.1",
        "proceso": "VIDA ULTIL DEL REACTIVO - 10 MESES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-58",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.3",
        "proceso": "ACCESORIOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-59",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.14",
        "proceso": "CALIBRADORES Y CONTROLES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-60",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.21",
        "proceso": "SISTEMA DE AGUA",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-61",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.25",
        "proceso": "REACTIVOS DE LA MISMA MARCA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-62",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.26",
        "proceso": "VOLUMENES MUERTOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-63",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.27",
        "proceso": "LABORATORIOS ALTERNOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-64",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.7",
        "proceso": "CENTRIFUGA",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-65",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.11",
        "proceso": "IMPRESORA LÁSER",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-66",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.16",
        "proceso": "REMODELACION Y ADECUACION",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-67",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.17",
        "proceso": "MANTENIMIENTOS CORRECTIVO Y PREVENTIVO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-68",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.2",
        "proceso": "REPORTE DE DESECHOS",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-69",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.28",
        "proceso": "RESPUESTA DE FALLA DE EQUIPOS",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-70",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.31",
        "proceso": "INSTALACIÓN DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-71",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.33",
        "proceso": "INFORME TRIMESTRAL",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "Reporte toca el 25-8-26 trimestral",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-72",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.5",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-73",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.6",
        "proceso": "SOFTWARE",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-74",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.1",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-75",
        "seccion": "RENGLÓN DEL 1 - 34 - ( QUÍMICA CLÍNICA) Atellica CI Marca: Siemens",
        "numeral": "1.23",
        "proceso": "INTERFAS DE SISTEMA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-76",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.2",
        "proceso": "CAPACIDAD DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-77",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.12",
        "proceso": "ABASTESIMIENTO DE INSUMOS",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-78",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.2",
        "proceso": "VIDA ULTIL DEL REACTIVO - 12 MESES",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-79",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.2.1",
        "proceso": "ACCESORIOS",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-80",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.3",
        "proceso": "CONTROL DE CALIDAD EXTERNO",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "Pendiente entrega del fabricante - final de Agosto",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-81",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.7",
        "proceso": "SILLA ERGONOMICA",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-82",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.15",
        "proceso": "MANUALES OPERATIVOS EN ESPAÑOL",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-83",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.17",
        "proceso": "SUMINISTRO DE LA MISMA MARCA",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-84",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.18",
        "proceso": "SISTEMA DE INFORMACION CLINICA",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "2026-07-31 00:00:00",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-85",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.2",
        "proceso": "ENTRENAMIENTO Y ASESORIA",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-86",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.21",
        "proceso": "LISTADO DE LABORATORIO ALTERNO",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-87",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.22",
        "proceso": "PLAN DE CONTINGENCIA",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-88",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.13",
        "proceso": "REMODELACION DEL AREA",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-89",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.14",
        "proceso": "MANTENIMIENTOS CORRECTIVO Y PREVENTIVO",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-90",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.16",
        "proceso": "REPORTE DE DESECHOS GENERADOS",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "Pendiente solicitar a fabrica 31/7/2026",
        "comentarioColor": "yellow"
      },
      {
        "id": "sta-ana-91",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.19",
        "proceso": "INSTALACIÓN DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-92",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.4",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-93",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.5",
        "proceso": "INTERFAS",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-94",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.6",
        "proceso": "SISTEMA INFORMATICO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-95",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.8",
        "proceso": "EQUIPO DE COMPUTO INTEGRADO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-96",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.9",
        "proceso": "IMPRESORA LASER",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-97",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.1",
        "proceso": "SISTEMA DE RED DE COMPUTADORA",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-98",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "1.11",
        "proceso": "INTERFAS DE CAMPO DE ESCRITURA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "sta-ana-99",
        "seccion": "RENGLÓN DEL 115 - ( URIANÁLISIS ) FUS-3000-PLUS Marca: DIRUI",
        "numeral": "FASE 1",
        "proceso": "PRE - INSTALACION",
        "ejecucion": "FASE 2",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      }
    ]
  },
  {
    "id": "hosp-militar",
    "titulo": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
    "contrato_num": "CT No 13-BS-2026",
    "cliente": "Hospital Militar Central",
    "filas": [
      {
        "id": "hosp-militar-1",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "1",
        "proceso": "ENTREGAS - VIÑETA",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-2",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "2",
        "proceso": "PEDIDO DEL  PRODUCTO",
        "ejecucion": "J. JOSE.",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-3",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "3",
        "proceso": "CONTROLES Y CONSUMIBLES",
        "ejecucion": "J. JOSE.",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-4",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "4",
        "proceso": "IMPORTACION",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-5",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "5",
        "proceso": "TRAMITES ADMINISTRATIVOS",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-6",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "6",
        "proceso": "GARANTIA",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-7",
        "seccion": "CONTRATO HOSPITAL MILITAR  - CT No 13-BS-2026",
        "numeral": "7",
        "proceso": "RECUPERACION DE COBROS",
        "ejecucion": "VANESA",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-8",
        "seccion": "(A) CONDICIONES ESPECIALES",
        "numeral": "1",
        "proceso": "CONDICIOENS ESPECIALES",
        "ejecucion": "NELSON",
        "ejecutado": false,
        "comentario": "PRESENTADO EN LA OFERTA",
        "comentarioColor": "blue"
      },
      {
        "id": "hosp-militar-9",
        "seccion": "EQUIPO GASES ARTERIALES EPOC - PAG 479",
        "numeral": "1",
        "proceso": "Lugar Aplica para Instalación de Equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-10",
        "seccion": "EQUIPO GASES ARTERIALES EPOC - PAG 479",
        "numeral": "2",
        "proceso": "UPS conectado detrás del equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-11",
        "seccion": "EQUIPO GASES ARTERIALES EPOC - PAG 479",
        "numeral": "3",
        "proceso": "Consideracion de AC",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-12",
        "seccion": "EQUIPO GASES ARTERIALES EPOC - PAG 479",
        "numeral": "4",
        "proceso": "Equipo Instalado en el Area de Hematologia",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-13",
        "seccion": "EQUIPO GASES ARTERIALES EPOC - PAG 479",
        "numeral": "5",
        "proceso": "Equipo colocado en mesa de gases arteriales",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-14",
        "seccion": "EQUIPO F200 - PAG. 481",
        "numeral": "1",
        "proceso": "Lugar Aplica para Instalación de Equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-15",
        "seccion": "EQUIPO F200 - PAG. 481",
        "numeral": "2",
        "proceso": "UPS conectado detrás del equipo",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-16",
        "seccion": "EQUIPO MINI CUBE  - PAG. 482",
        "numeral": "1",
        "proceso": "Equipo Instalado en Optimas Condiciones",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-17",
        "seccion": "EQUIPO MINI CUBE  - PAG. 482",
        "numeral": "2",
        "proceso": "UPS conectado detrás del equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-18",
        "seccion": "EQUIPO MINI CUBE  - PAG. 482",
        "numeral": "3",
        "proceso": "Equipo Instalado en el Area de Hematologia",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-19",
        "seccion": "EQUIPO RAPID POINT 500e  - PAG. 483",
        "numeral": "1",
        "proceso": "Lugar Aplica para Instalación de Equipo",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-20",
        "seccion": "EQUIPO RAPID POINT 500e  - PAG. 483",
        "numeral": "2",
        "proceso": "UPS Conectado en mesa de hematologia",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-21",
        "seccion": "EQUIPO RAPID POINT 500e  - PAG. 483",
        "numeral": "3",
        "proceso": "Equipo Instalado en el Area de Hematologia",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-22",
        "seccion": "EQUIPO RAPID POINT 500e  - PAG. 483",
        "numeral": "4",
        "proceso": "Mesa o Mueble para el Equipo",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente compra - pendiente instalacion a solicitud del administrador",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-23",
        "seccion": "EQUIPO RAPID POINT 500e  - PAG. 483",
        "numeral": "5",
        "proceso": "Lector de codigo de Barra",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-24",
        "seccion": "EQUIPO IMMULITE 2000 Xpi  - PAG. 484",
        "numeral": "1",
        "proceso": "Lugar Aplica para Instalación de Equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-25",
        "seccion": "EQUIPO IMMULITE 2000 Xpi  - PAG. 484",
        "numeral": "2",
        "proceso": "UPS conectado detrás del equipo",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-26",
        "seccion": "EQUIPO IMMULITE 2000 Xpi  - PAG. 484",
        "numeral": "3",
        "proceso": "Instalacion de AC",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-27",
        "seccion": "EQUIPO IMMULITE 2000 Xpi  - PAG. 484",
        "numeral": "4",
        "proceso": "SISTEMA DE COMPUTO",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-28",
        "seccion": "EQUIPO IMMULITE 2000 Xpi  - PAG. 484",
        "numeral": "4",
        "proceso": "IMPRESORA,ZEBRA Y SILLA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-29",
        "seccion": "RENGLÓN 3 - (ERITROSEDIMENTACIÓN) MINI-CUBE  Marca: DIESSE",
        "numeral": "1.1",
        "proceso": "Equipo en Optimas Condiciones",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-30",
        "seccion": "RENGLÓN 3 - (ERITROSEDIMENTACIÓN) MINI-CUBE  Marca: DIESSE",
        "numeral": "1.2",
        "proceso": "Capacidad del Equipo",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "pendiente capacitacion",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-31",
        "seccion": "RENGLÓN 3 - (ERITROSEDIMENTACIÓN) MINI-CUBE  Marca: DIESSE",
        "numeral": "1.3",
        "proceso": "ACCESORIOS",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "se realizara acta de satisfaccion",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-32",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.11",
        "proceso": "Capacidad de Datos Historicos",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-33",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.2",
        "proceso": "Capacidad del Equipo",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-34",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.6",
        "proceso": "Capacitacion del Persona",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-35",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.7",
        "proceso": "Capacidad del Equipo",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-36",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.17",
        "proceso": "Capacidad el Equipo y Capacitacion",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-37",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.2",
        "proceso": "Controles",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-38",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.22",
        "proceso": "MANUAL Y CAPACITACION",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-39",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.5",
        "proceso": "Manual o instructivo de operaciones",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "Se entregara digital",
        "comentarioColor": "blue"
      },
      {
        "id": "hosp-militar-40",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.14",
        "proceso": "Consumibles",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-41",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.4",
        "proceso": "Controles interno de Tercera Opinion",
        "ejecucion": "JUAN JOSE",
        "ejecutado": false,
        "comentario": "Pendiente que proveedor entrege controles (31-08-26)  - Marca: Biorad",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-42",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.1",
        "proceso": "Controles de calidad interno y 3era opinion",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "Pendiente que proveedor entrege controles (31-08-26)  - Marca: Biorad",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-43",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.16",
        "proceso": "Centrifuga de 30 tubos",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-44",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.1",
        "proceso": "Equipo en Optimas Condiciones",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-45",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.8",
        "proceso": "ACCESORIOS",
        "ejecucion": "RICARDO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-46",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.15",
        "proceso": "UPS",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-47",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.21",
        "proceso": "UPS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-48",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.3",
        "proceso": "Sistema de Gestión Hospitalaria",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-49",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.9",
        "proceso": "Sistema de Gestión Hospitalaria",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-50",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.12",
        "proceso": "Sistema Informatico",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-51",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.13",
        "proceso": "Muestras interfasadas",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-52",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.18",
        "proceso": "Sistema Informatico",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-53",
        "seccion": "RENGLÓN 34,49 al 64 - (PRUEBAS ESPECIALES) INMMULITE 2000 XPI  Marca: SIEMENS",
        "numeral": "1.19",
        "proceso": "Equipo Interfasado",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-54",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.2",
        "proceso": "CONTROLES Y CONSUMIBLES",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-55",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.3",
        "proceso": "Capacidad del Equipo",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-56",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.7",
        "proceso": "CONTROLES",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "Pendiente control de calidad",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-57",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.9",
        "proceso": "MANUAL DE OPERACIONES",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "pendiente manual digital",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-58",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.1",
        "proceso": "CAPACITACION DEL EQUIPO",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "pendiente capacitacion",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-59",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.6",
        "proceso": "CONTROLES DE TERCERA OPINION",
        "ejecucion": "JUAN JOSE",
        "ejecutado": false,
        "comentario": "pendiente control de calidad",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-60",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.1",
        "proceso": "INSTALACION DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "Pendiente compra - pendiente instalacion a solicitud del administrador",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-61",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.8",
        "proceso": "UPS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-62",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.4",
        "proceso": "SISTEMA DE COMPUTO",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-63",
        "seccion": "RENGLÓN 36, 65 al 69 y 71 - (PRUEBAS ESPECIALES) F200  Marca: SD BIOSENSOR",
        "numeral": "1.5",
        "proceso": "INTERFAZ",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-64",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.6",
        "proceso": "MANUAL OPERATIVO Y CAPACITACION",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "pendiente manual digital",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-65",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.4",
        "proceso": "Consumibles",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-66",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.1",
        "proceso": "INSTALACION DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-67",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.5",
        "proceso": "UPS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-68",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.2",
        "proceso": "CONECCION AL SISTEMA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-69",
        "seccion": "RENGLÓN 40 - (GASES ARTERIALES) RAPID POINT  Marca: SIEMENS",
        "numeral": "1.3",
        "proceso": "SISTEMA DE COMPUTO",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "Pendiente instalacion - aun cuentan con pruebas de prov. Anterior",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-70",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.6",
        "proceso": "MANUAL Y CAPACITACION DEL PERSONA",
        "ejecucion": "EDGAR",
        "ejecutado": true,
        "comentario": "pendiente manual digital",
        "comentarioColor": "yellow"
      },
      {
        "id": "hosp-militar-71",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.4",
        "proceso": "Consumibles",
        "ejecucion": "JUAN CARLOS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-72",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.1",
        "proceso": "INSTALACION DEL EQUIPO",
        "ejecucion": "MOISES",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-73",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.5",
        "proceso": "UPS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-74",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.2",
        "proceso": "SISTEMA HOSPITALARIA",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "Se realizara acta de satisfacion",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-75",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "1.3",
        "proceso": "SISTEMA DE COMPUTO",
        "ejecucion": "RICARDO",
        "ejecutado": false,
        "comentario": "Se realizara acta de satisfacion",
        "comentarioColor": "none"
      },
      {
        "id": "hosp-militar-76",
        "seccion": "RENGLÓN 41 - (GASES ARTERIALES) EPOC   Marca: SIEMENS",
        "numeral": "FASE 1",
        "proceso": "PRE - INSTALACION",
        "ejecucion": "FASE 2",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      }
    ]
  },
  {
    "id": "isbm",
    "titulo": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
    "contrato_num": "CT No AD-014/2026-ISBM",
    "cliente": "ISBM (Bienestar Magisterial)",
    "filas": [
      {
        "id": "isbm-1",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "1",
        "proceso": "PEDIDO DEL  PRODUCTO",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-2",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "2",
        "proceso": "CONTROLES Y CONSUMIBLES",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-3",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "3",
        "proceso": "IMPORTACION",
        "ejecucion": "MARISELA",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-4",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "4",
        "proceso": "TRAMITES ADMINISTRATIVOS",
        "ejecucion": "ROBERTO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-5",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "5",
        "proceso": "GARANTIA",
        "ejecucion": "ROBERTO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-6",
        "seccion": "CONTRATO ISBM - CT No AD-014/2026-ISBM",
        "numeral": "6",
        "proceso": "RECUPERACION DE COBROS",
        "ejecucion": "VANESA",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-7",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "1",
        "proceso": "REACTIVO MAYOR A 18 MESES O CARTA",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-8",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "2",
        "proceso": "GARANTIA DE FABRICA AUTENTICADO",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "SE SOLICITARA A FABRICA SE ENTREGARA EL 31-07-2026",
        "comentarioColor": "blue"
      },
      {
        "id": "isbm-9",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "3",
        "proceso": "INSUMOS NECESARIOS",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-10",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "4",
        "proceso": "MANUALES IMPRESOSA PARA CADA CENTRO",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "Se enviara en fisco",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-11",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "5",
        "proceso": "FUNDAMENTO DE LA PRUEBA CON LOS RANGOS",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "se entregaria 10-08-2026",
        "comentarioColor": "blue"
      },
      {
        "id": "isbm-12",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "6",
        "proceso": "CONTROLES DE 3ERA OPINION",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "YA SOLICITADOS 24-08-2026",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-13",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "7",
        "proceso": "CALENDARIZACION DE MANTENIMIENTOS",
        "ejecucion": "MOISES",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-14",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "8",
        "proceso": "CAPACITACION AL PERSONAL DE CADA LAB.",
        "ejecucion": "EDGAR",
        "ejecutado": false,
        "comentario": "Se estan recopilando firmas de capacitacion",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-15",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "9",
        "proceso": "NUMERO, CORREO, DIRECCION DE ESMERGENCIA",
        "ejecucion": "LUIS",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-16",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "10",
        "proceso": "REPOSICION DE EQUIPO",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-17",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "11",
        "proceso": "PLAN DE CONTINGENCIA",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-18",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "12",
        "proceso": "REPOSICION DEL REACTIVO",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-19",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "13",
        "proceso": "REPOSICION DE REACTIVOS DESPERDICIADOS",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-20",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "14",
        "proceso": "NO RETIRO DE EQUIPO POR PRUEBA EN INV.",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-21",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "15",
        "proceso": "EXCLUSIÓN DE RESPONSABILIDAD",
        "ejecucion": "JULIO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-22",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "16",
        "proceso": "CARTA DE AUTORIZACION DEL FABRICANTE",
        "ejecucion": "JULIO",
        "ejecutado": true,
        "comentario": "2026-07-23 00:00:00",
        "comentarioColor": "none"
      },
      {
        "id": "isbm-23",
        "seccion": "ELECTROLITOS EXIAS e1, Marca: EXIAS",
        "numeral": "17",
        "proceso": "N/A",
        "ejecucion": "ROBERTO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      }
    ]
  },
  {
    "id": "bloom",
    "titulo": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
    "contrato_num": "N° 68/2026",
    "cliente": "Hospital Nacional de Niños Benjamín Bloom",
    "filas": [
      {
        "id": "bloom-1",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "1",
        "proceso": "PEDIDO DEL  PRODUCTO",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-2",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "2",
        "proceso": "CONTROLES Y CONSUMIBLES",
        "ejecucion": "JUAN JOSE",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-3",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "3",
        "proceso": "IMPORTACION",
        "ejecucion": "MARISELA",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-4",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "4",
        "proceso": "TRAMITES ADMINISTRATIVOS",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-5",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "5",
        "proceso": "GARANTIA",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-6",
        "seccion": "CONTRATO HOSPITAL BLOOM - N° 68/2026",
        "numeral": "6",
        "proceso": "RECUPERACION DE COBROS",
        "ejecucion": "VANESA",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-7",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "1",
        "proceso": "Garantia de reposicion de reactivos",
        "ejecucion": "Rober/nelson",
        "ejecutado": true,
        "comentario": "Presentado en la oferta",
        "comentarioColor": "blue"
      },
      {
        "id": "bloom-8",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "2",
        "proceso": "Hojas de seguridad",
        "ejecucion": "Rober/nelson",
        "ejecutado": true,
        "comentario": "Presentado en la oferta",
        "comentarioColor": "blue"
      },
      {
        "id": "bloom-9",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "3",
        "proceso": "Reactivo No menor a un año",
        "ejecucion": "Juan carlos",
        "ejecutado": true,
        "comentario": "seguimiento",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-10",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "4",
        "proceso": "Instalacion de equipo y Calendarizacion",
        "ejecucion": "Moises",
        "ejecutado": true,
        "comentario": "Pendiente Calendarizacion",
        "comentarioColor": "yellow"
      },
      {
        "id": "bloom-11",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "5",
        "proceso": "N/A",
        "ejecucion": "ROBERTO",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-12",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "6",
        "proceso": "N/A",
        "ejecucion": "ROBERTO",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-13",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "7",
        "proceso": "Sistema informatico SIS",
        "ejecucion": "Ricardo",
        "ejecutado": true,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-14",
        "seccion": "EQUIPO CHORUS EVO - ITEM 1, 7, 8, 17 Y 36",
        "numeral": "8",
        "proceso": "Metodologia Elisa",
        "ejecucion": "Edgar",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      },
      {
        "id": "bloom-15",
        "seccion": "PRUEBA RAPIDA 2 Y 35",
        "numeral": "1",
        "proceso": "Garantia de reposicion de reactivos",
        "ejecucion": "Rober/nelson",
        "ejecutado": true,
        "comentario": "Presentado en la oferta",
        "comentarioColor": "blue"
      },
      {
        "id": "bloom-16",
        "seccion": "PRUEBA RAPIDA 2 Y 35",
        "numeral": "2",
        "proceso": "Fecha de vencimiento",
        "ejecucion": "Rober/nelson",
        "ejecutado": true,
        "comentario": "Presentado en la oferta",
        "comentarioColor": "blue"
      },
      {
        "id": "bloom-17",
        "seccion": "PRUEBA RAPIDA 2 Y 35",
        "numeral": "3",
        "proceso": "Control Pos Venta",
        "ejecucion": "Rober/nelson",
        "ejecutado": false,
        "comentario": "",
        "comentarioColor": "none"
      }
    ]
  }
];
