# Reglas de negocio

## Conceptos

### Empleado

Se identifica mediante `Nº Nómina`. Debe tratarse como texto y conservarse de manera estable en todas las filas.

### Episodio de ausencia

Cada fila de baja laboral representa un episodio completo delimitado por fecha inicial y final, ambas incluidas. No existen ausencias parciales ni por horas.

### Vacaciones

Las vacaciones aparecen con una fila por día. Los días consecutivos del mismo empleado deben agruparse en un único periodo vacacional. No existen solapamientos entre bajas, vacaciones ni combinaciones de ambas.

### Centro y ámbito

- `Ubicación - Código` identifica el centro de trabajo; el estándar exacto del código está pendiente de confirmar.
- La cabecera de origen `Ambito` representa la sección o zona de trabajo dentro del centro.
- El centro registrado corresponde al momento de la ausencia. Los cambios de centro son excepcionales.

### Fecha de corte

Fecha hasta la que se considera la información. Por defecto es el último día del mes completo anterior al actual y puede ser modificada por el usuario.

### Final efectivo

- Un episodio que comienza después de la fecha de corte se excluye del análisis y se incluye en el resumen de advertencias.
- Para un episodio que comienza en la fecha de corte o antes, el final efectivo es la menor fecha entre el final de origen y la fecha de corte.
- Si el final es `31/12/2999`, se utiliza la fecha de corte y el episodio se marca como activo.
- Si un final distinto del centinela es posterior a la fecha de corte, se recorta para el análisis y se conserva el final original en el detalle junto con una advertencia.

### Duración total efectiva

Número de días naturales incluidos entre inicio y final efectivo:

`duración = final efectivo - inicio + 1`

### Días dentro del periodo

Número de días de intersección entre el episodio y el periodo analizado. No cambia la clasificación corta o larga del episodio.

## Regla R1: recurrencia de corta duración

- Solo participan episodios de baja laboral; `Vacaciones` queda excluida del cálculo, del listado y del detalle operativo habitual.
- Un episodio es corto si su duración total efectiva es menor o igual a 30 días.
- Un empleado es recurrente si acumula al menos 5 episodios cortos en una ventana de 12 meses.
- Se evalúa únicamente la ventana de 12 meses que termina en la fecha de corte. Sus límites inclusivos son el día posterior a la misma fecha del año anterior y la propia fecha de corte.
- El episodio pertenece a la ventana de recurrencia en función de su fecha de inicio.
- Un episodio iniciado antes de la ventana no incrementa el contador aunque termine dentro.
- Los resultados se ordenan por:
  1. número de episodios descendente;
  2. fecha de inicio del episodio más reciente descendente;
  3. identificador de empleado ascendente como criterio técnico estable, salvo que el usuario defina otro.
- Debe mostrarse la ventana que produjo la coincidencia y los episodios contabilizados.

## Regla R2: larga duración

- Solo participan episodios de baja laboral; `Vacaciones` queda excluida del cálculo, del listado y del detalle operativo habitual.
- Un episodio es de larga duración si su duración total efectiva es mayor o igual a 180 días.
- La clasificación utiliza la duración total efectiva, no solo los días visibles dentro del periodo filtrado.
- Las métricas del periodo utilizan exclusivamente los días que intersectan con él.
- Se muestran los 10 empleados con el episodio individual más largo.
- Sin filtro de centro, el top se calcula sobre todos los centros.
- Con uno o varios centros seleccionados, el top se recalcula sobre el conjunto filtrado.
- Cada empleado aparece una sola vez, representado por su episodio largo de mayor duración, con acceso al detalle de sus demás episodios.
- Los resultados se ordenan por duración máxima descendente, fecha de inicio del episodio representativo descendente y, finalmente, identificador de empleado ascendente.
- Si un empleado tiene varios episodios con la misma duración máxima, se utiliza como representativo el de fecha de inicio más reciente.
- Se debe indicar cuándo un episodio es largo por su duración total aunque solo una parte se contabilice en el periodo visible.

## Regla futura: adyacencia a vacaciones

- Las vacaciones se conservan únicamente como contexto temporal para esta regla futura y no se convierten en ausencias médicas.
- Agrupar primero días consecutivos de vacaciones.
- Existe adyacencia anterior si la baja termina el día natural inmediatamente anterior al inicio de vacaciones.
- Existe adyacencia posterior si la baja comienza el día natural inmediatamente posterior al final de vacaciones.
- No buscar solapamientos porque la fuente garantiza que no existen.

## Festivos: fuera de alcance

La plantilla analizada trabaja a turnos los 365 días del año y las 24 horas, de modo que un día festivo puede ser laborable para cualquier empleado. Los festivos no aportan información a ninguna regla y quedan excluidos de forma permanente.

En consecuencia, el análisis no necesita calendarios laborales, ni tablas maestras de centros, ni ninguna otra fuente de datos externa al archivo importado.

## Principios de explicación

Cada resultado debe poder indicar:

- regla aplicada y versión;
- fecha de corte y periodo;
- valores límite usados;
- episodios contabilizados y descartados;
- duración total y días dentro del periodo;
- centro o centros incluidos;
- criterio de ordenación;
- motivo de cualquier advertencia.
