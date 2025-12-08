## 1. DESCRIPCIÓN FORMAL DEL PROBLEMA

**1.1 Definición del Problema
Problema:** Sistema de Detección de Colisiones de Aeronaves en Tiempo Real
**Contexto:** Se tiene un sistema de control de tráfico aéreo que monitorea la posición de
múltiples aeronaves en un espacio euclidiano bidimensional acotado [0, 100] × [0, 100]
unidades.
**1.2 Especificación Formal**
Dado un conjunto finito S de n aeronaves, donde cada aeronave aᵢ ∈ S posee:
● **Posición actual:** pᵢ = (xᵢ, yᵢ) ∈ [0, 100]²
● **Velocidad:** vᵢ = (dxᵢ, dyᵢ) ∈ ℝ² (componentes de desplazamiento por
actualización)
● **Identificador único:** idᵢ ∈ String
● **Información de vuelo:** callsign, passengers, pilotName, origin, destination
● **Estado de colisión:** sᵢ ∈ {safe, warning, danger, collision}
**1.3 Restricciones**
● Espacio de simulación: [0, 100] × [0, 100]
● Las aeronaves rebotan en los límites del espacio
● Una vez en estado "collision", la aeronave se detiene
● El sistema debe operar en tiempo real con actualizaciones cada 2 segundos

**2. Justificación del Uso de Divide y Vencerás
2.1 Problema de fuerza bruta**
Un algoritmo de fuerza bruta requeriría comparar cada aeronave con todas las demás:

**Complejidad** : O(n²) para _n_ aeronaves, lo que resulta ineficiente para grandes
volúmenes.
**2.2 Estrategia Divide y Vencerás**
El algoritmo implementado utiliza el paradigma de **Divide y Vencerás** inspirado
en el problema clásico del "Par de Puntos Más Cercano" (Closest Pair of Points):
**● Fase 1: Dividir**
El conjunto de aeronaves se divide recursivamente en dos subconjuntos
de tamaño aproximadamente igual.
**● Fase 2: Conquistar**
Se resuelven recursivamente los subproblemas en las mitades izquierda y
derecha, detectando colisiones **internas** a cada subconjunto.
**● Fase 3: Combinar**
Se detectan colisiones **cruzadas** entre aeronaves de diferentes mitades
usando una optimización clave:
**Optimización crítica** : Se mantiene una lista ordenada por coordenada _y_
(sortedByY) que permite descartar pares distantes sin calcular su distancia
euclidiana:

**2.3 Ventajas del Enfoque**

1. **Reducción de comparaciones** : Evita comparaciones innecesarias entre
   aeronaves muy distantes
2. **Poda eficiente** : El ordenamiento por _y_ permite terminar búsquedas
   anticipadamente
3. **Escalabilidad** : Complejidad logarítmica en el factor recursivo
4. **Localidad espacial** : Aprovecha que colisiones solo ocurren entre objetos
   cercanos
   **2.4 Integración con Cola de Prioridad**
   El sistema complementa Divide y Vencerás con una **cola de prioridad** implementada
   como lista enlazada ordenada:
   Esto permite procesar alertas en orden de gravedad, garantizando que colisiones
   críticas se atiendan primero.
   **3. Análisis de Complejidad
   3.1 Complejidad Temporal
   Fase de Preprocesamiento**
   const sortedByY = [...aircrafts].sort((a, b) => a.y - b.y);

● **Ordenamiento inicial** : O(n log n)
● Se ejecuta **una sola vez** antes de la recursión
**Fase Recursiva: divideAndConquer**
La recurrencia del algoritmo es:
T(n) = 2T(n/2) + O(n)
Donde:
● 2T(n/2): Dos llamadas recursivas en mitades del conjunto
● O(n): Costo de findCrossPairsOptimized
Por el **Teorema Maestro** (caso 2):
T(n) = O(n log n)
**Análisis de findCrossPairsOptimized
Caso promedio** : O(n)
● El break temprano limita el bucle interno a un número constante de iteraciones
(aeronaves dentro del umbral)
● En práctica, cada aeronave solo se compara con ~k vecinos cercanos (k << n)
**Caso peor** : O(n²)
● Todas las aeronaves concentradas en una franja vertical estrecha
● Poco probable en simulaciones realistas con distribución uniforme
**Complejidad Total del Detector**

T_total = O(n log n)\_ordenamiento + O(n log n)\_divide_y_vencerás
T_total = O(n log n)
**Operaciones Adicionales**
● **Encolado en PriorityAlertQueue** : O(m) donde m = número de alertas (m ≤ n)
● **Actualización de estados** : O(n)
● **Costo por frame** (cada 2 segundos): O(n log n)
**3.2 Complejidad Espacial
Estructuras de Datos Principales**

1. **Array de aeronaves** : O(n)
2. **sortedByY (copia ordenada)** : O(n)
3. **Sets de índices en findCrossPairsOptimized** : O(n)
4. **Pila de recursión** : O(log n)
   ● Profundidad máxima del árbol de recursión
   ● Cada nivel almacena parámetros constantes
5. **Arrays de pares** : O(p)
   ● Donde p = número de pares detectados
   ● En el peor caso: p = O(n²), pero típicamente p << n² debido a umbrales
6. **PriorityAlertQueue** : O(m)
   ● m = número de alertas activas
   ● Lista enlazada con m nodos
7. **CollisionHistory** : O(h)
   ● h = colisiones históricas acumuladas
   **Espacio Total**

**3.3 Optimizaciones Implementadas**

1. **Ordenamiento único** : Se ordena una sola vez antes de la recursión, no en cada
   nivel
2. **Poda por distancia Y** : Evita cálculos de distancia euclidiana innecesarios
3. **Verificación de duplicados** : alertQueue.contains() previene alertas
   redundantes
4. **Inmutabilidad selectiva** : Aircraft es inmutable, pero se evitan copias
   innecesarias
   **3.4 Limitaciones y Consideraciones**
5. **Peor caso O(n²)** : Puede ocurrir con distribuciones patológicas (todas las
   aeronaves en línea vertical)
6. **Overhead de recursión** : Para n muy pequeño (<50), el enfoque naive podría
   ser más rápido debido a constantes menores
7. **Memoria adicional** : El array sortedByY duplica el uso de memoria
   temporalmente
8. **Sincronización** : El intervalo de 2 segundos asume que O(n log n) se completa
   en tiempo razonable (<2s para n~1000)
   **Conclusión**
   La implementación demuestra un uso efectivo de **Divide y Vencerás** para reducir la
   complejidad de detección de colisiones de O(n²) a **O(n log n)** , haciéndola viable para
   sistemas de control aéreo con cientos o miles de aeronaves. La integración con una
   cola de prioridad garantiza que las alertas críticas se procesen primero, cumpliendo con
   los requisitos de tiempo real del sistema.
   El diseño modular permite futuras optimizaciones como:
   ● Uso de estructuras espaciales (Quadtree, R-tree)

● Paralelización de las ramas recursivas
● Predicción de trayectorias para alertas anticipadas
● Procesamiento incremental (solo aeronaves que cambiaron posición)
