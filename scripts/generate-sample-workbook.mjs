// Genera libros sintéticos con la forma del perfil de importación `ausencias-v1`.
// Ejecutar con: node scripts/generate-sample-workbook.mjs --rows 150000 --out samples/demo-150000.xlsx
//
// Todos los valores son inventados. El generador es determinista: con la misma
// semilla produce exactamente el mismo libro, de modo que las mediciones de
// rendimiento son reproducibles y el archivo se puede regenerar sin versionarlo.

import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import writeXlsxFile from 'write-excel-file/node';

const HEADERS = [
  'Nº Nómina',
  'Activo/Inactivo',
  'Convenio Laboral',
  'Fecha Inicio Ausencia',
  'Fecha Fin Ausencia',
  'Descripción Ausencia',
  'Ambito',
  'Fecha Nacimiento',
  'Tipo de Empleado',
  'Fijo/Temporal',
  'Plan Salarial - Desc.',
  'Sexo',
  'Ubicación - Código',
  'Número de Días de Ausencia a Fecha de hoy',
];

const SICKNESS_DESCRIPTIONS = [
  'Enfermedad con Baja en la S.S',
  'Accidente Laboral',
  'Ampliacion Incapacidad Temp',
];

const SCOPES = ['CEN', 'CIC', 'IBI', 'MYP', 'PAC', 'PAX', 'PRO', 'RAM', 'SGE', 'TER'];
const EMPLOYEE_TYPES = ['EV', 'FD', 'FJI', 'FJR', 'FTP'];
const CONTRACT_TYPES = ['Fijo', 'Fijo/Temporal', 'Temporal'];
const AGREEMENTS = ['HND-14', 'RG-14', 'TI-15'];
const SALARY_PLANS = [
  'ADMINISTRATIVOS',
  'Fuera CC',
  'GRUPO SUPERIOR GESTORES Y TEC.',
  'SE ADMINISTRATIVO',
  'SE SERVICIOS AUXILIARES',
  'SERVICIOS AUXILIARES',
];

// Códigos de centro neutros: el inventario real no es relevante para el análisis.
const WORK_CENTRES = Array.from({ length: 24 }, (_, index) => `C${String(index + 1).padStart(3, '0')}`);

const DAY_IN_MS = 86_400_000;

function parseArguments(argv) {
  const options = {
    rows: 150_000,
    out: 'samples/demo-150000.xlsx',
    seed: 20260821,
    cutoff: '2026-07-31',
    // 0 = derivar de la volumetría para conservar la densidad de referencia.
    employees: 0,
    // 21.500 de 150.000 en el conjunto de referencia.
    sicknessShare: 0.1433,
  };

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, '');
    const value = argv[index + 1];
    if (key === undefined || value === undefined) continue;
    if (key in options) {
      options[key] = typeof options[key] === 'number' ? Number(value) : value;
    }
  }

  return options;
}

// mulberry32: PRNG pequeño y determinista, suficiente para datos de prueba.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function integerBetween(random, minimum, maximum) {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function toEpochDay(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

// Texto DD/MM/AAAA: evita depender del formato de celda y de la zona horaria.
function formatSpanishDate(epochDay) {
  const date = new Date(epochDay * DAY_IN_MS);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function text(value) {
  return { value, type: String };
}

function buildEmployees(random, count) {
  return Array.from({ length: count }, (_, index) => ({
    // Como texto y con ceros a la izquierda: el perfil rechaza los numéricos.
    payrollNumber: String(900_000 + index).padStart(6, '0'),
    status: random() < 0.92 ? 'Activo' : 'Inactivo',
    agreement: pick(random, AGREEMENTS),
    scope: pick(random, SCOPES),
    birthDate: formatSpanishDate(
      toEpochDay('1965-01-01') + integerBetween(random, 0, 40 * 365),
    ),
    employeeType: pick(random, EMPLOYEE_TYPES),
    contractType: pick(random, CONTRACT_TYPES),
    salaryPlan: pick(random, SALARY_PLANS),
    sex: random() < 0.42 ? 'F' : 'M',
    workCentre: pick(random, WORK_CENTRES),
  }));
}

function employeeCells(employee) {
  return {
    before: [text(employee.payrollNumber), text(employee.status), text(employee.agreement)],
    after: [
      text(employee.scope),
      text(employee.birthDate),
      text(employee.employeeType),
      text(employee.contractType),
      text(employee.salaryPlan),
      text(employee.sex),
      text(employee.workCentre),
    ],
  };
}

function buildRow(employee, startDay, endDay, description, reportedDays) {
  const { before, after } = employeeCells(employee);
  return [
    ...before,
    text(formatSpanishDate(startDay)),
    text(formatSpanishDate(endDay)),
    text(description),
    ...after,
    // La aplicación descarta este valor: se rellena de forma inconsistente a propósito.
    { value: reportedDays, type: Number },
  ];
}

// En el conjunto de referencia cada empleado acumula unos 10,75 episodios de baja en dos años.
// Esa densidad es la que hace que aparezcan candidatos de recurrencia corta: si se fija una
// plantilla grande sobre pocos episodios, nadie alcanza los cinco de la ventana y R1 queda vacía.
const EPISODES_PER_EMPLOYEE = 10.75;

function resolveEmployeeCount(options, sicknessTarget) {
  if (options.employees > 0) return options.employees;
  return Math.max(40, Math.round(sicknessTarget / EPISODES_PER_EMPLOYEE));
}

function generateRows(options) {
  const random = createRandom(options.seed);
  const sicknessTarget = Math.round(options.rows * options.sicknessShare);
  const employees = buildEmployees(random, resolveEmployeeCount(options, sicknessTarget));
  const cutoffDay = toEpochDay(options.cutoff);
  const windowStart = cutoffDay - 730;

  const rows = [];

  for (let index = 0; index < sicknessTarget; index += 1) {
    const employee = employees[index % employees.length];
    const startDay = integerBetween(random, windowStart, cutoffDay);
    const roll = random();

    let duration;
    if (roll < 0.82) {
      duration = integerBetween(random, 1, 30);
    } else if (roll < 0.97) {
      duration = integerBetween(random, 31, 179);
    } else {
      duration = integerBetween(random, 180, 400);
    }

    // Una parte pequeña queda como episodio abierto con el centinela del perfil.
    const openEnded = random() < 0.004;
    const endDay = openEnded ? toEpochDay('2999-12-31') : startDay + duration - 1;

    rows.push(
      buildRow(
        employee,
        startDay,
        endDay,
        pick(random, SICKNESS_DESCRIPTIONS),
        pick(random, [0, 1, duration, 999]),
      ),
    );
  }

  // Las vacaciones se registran como una fila por día disfrutado.
  while (rows.length < options.rows) {
    const employee = employees[integerBetween(random, 0, employees.length - 1)];
    const periodStart = integerBetween(random, windowStart, cutoffDay);
    const periodLength = Math.min(
      integerBetween(random, 1, 15),
      options.rows - rows.length,
      cutoffDay - periodStart + 1,
    );

    for (let day = 0; day < periodLength; day += 1) {
      const currentDay = periodStart + day;
      rows.push(buildRow(employee, currentDay, currentDay, 'Vacaciones', 1));
    }
  }

  return rows;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const startedAt = performance.now();

  const rows = generateRows(options);
  const data = [HEADERS.map((header) => ({ value: header, type: String, fontWeight: 'bold' })), ...rows];

  await mkdir(dirname(options.out), { recursive: true });
  await writeXlsxFile(data, { sheet: 'Ausencias' }).toFile(options.out);

  const sickness = rows.length - rows.filter((row) => row[5].value === 'Vacaciones').length;
  const distinctEmployees = new Set(rows.map((row) => row[0].value)).size;
  const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);

  console.log(`Archivo generado: ${options.out}`);
  console.log(`  Filas de datos:        ${rows.length}`);
  console.log(`  Episodios de baja:     ${sickness}`);
  console.log(`  Filas de vacaciones:   ${rows.length - sickness}`);
  console.log(`  Empleados distintos:   ${distinctEmployees}`);
  console.log(`  Semilla:               ${options.seed}`);
  console.log(`  Generado en:           ${elapsed} s`);
}

await main();
