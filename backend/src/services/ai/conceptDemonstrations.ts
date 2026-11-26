export interface ConceptDemonstration {
  type: 'java_inheritance' | 'bubble_sort' | 'computer_networks' | 'mathematics' | 'database_normalization' | 'generic';
  title: string;
  description: string;
  visualData: any;
}

export function detectConceptDemonstration(query: string, response: string): ConceptDemonstration | null {
  const text = `${query} ${response}`.toLowerCase();

  // 1. Java Inheritance
  if (text.includes('inheritance') || text.includes('subclass') || text.includes('super class') || text.includes('extends')) {
    return {
      type: 'java_inheritance',
      title: 'Class Hierarchy & Polymorphic Inheritance',
      description: 'Visualization of superclass members inherited by subclasses with method overriding and dynamic dispatch.',
      visualData: {
        parent: { name: 'Vehicle', members: ['speed: int', 'brand: String'], methods: ['accelerate()', 'brake()'] },
        children: [
          { name: 'Car', extraMembers: ['numDoors: int'], overrides: ['accelerate()'] },
          { name: 'ElectricCar', extraMembers: ['batteryLevel: int'], overrides: ['charge()', 'accelerate()'] },
        ],
      },
    };
  }

  // 2. Bubble Sort
  if (text.includes('bubble sort') || text.includes('sorting algorithm') || text.includes('array swap')) {
    return {
      type: 'bubble_sort',
      title: 'Bubble Sort In-Place Swapping Execution',
      description: 'Step-by-step element pairwise comparison bubbling the maximum element to the rightmost partition.',
      visualData: {
        initialArray: [45, 12, 89, 34, 25, 7],
        passes: [
          { step: 1, compared: [0, 1], array: [12, 45, 89, 34, 25, 7], swapped: true },
          { step: 2, compared: [1, 2], array: [12, 45, 89, 34, 25, 7], swapped: false },
          { step: 3, compared: [2, 3], array: [12, 45, 34, 89, 25, 7], swapped: true },
          { step: 4, compared: [3, 4], array: [12, 45, 34, 25, 89, 7], swapped: true },
          { step: 5, compared: [4, 5], array: [12, 45, 34, 25, 7, 89], swapped: true },
        ],
      },
    };
  }

  // 3. Computer Networks
  if (text.includes('network') || text.includes('packet') || text.includes('tcp') || text.includes('router') || text.includes('osi model')) {
    return {
      type: 'computer_networks',
      title: 'Packet Routing Across Network Topologies',
      description: 'Hop-by-hop packet transmission between source client, edge routers, and destination cloud server.',
      visualData: {
        nodes: [
          { id: 'client', label: 'Client (192.168.1.10)', type: 'host' },
          { id: 'r1', label: 'Gateway Router', type: 'router' },
          { id: 'r2', label: 'Transit Core Router', type: 'router' },
          { id: 'server', label: 'Cloud Server (203.0.113.1)', type: 'host' },
        ],
        activePacket: { from: 'client', to: 'server', protocol: 'TCP SYN', payloadBytes: 64 },
      },
    };
  }

  // 4. Mathematics
  if (text.includes('equation') || text.includes('calculus') || text.includes('derivative') || text.includes('integral') || text.includes('formula')) {
    return {
      type: 'mathematics',
      title: 'Step-by-Step Mathematical Derivation',
      description: 'Analytical decomposition of algebraic and differential principles.',
      visualData: {
        steps: [
          { label: 'Original Function', formula: 'f(x) = x^3 - 4x^2 + 6x - 2' },
          { label: 'Apply Power Rule', formula: 'd/dx [x^n] = n x^(n-1)' },
          { label: 'First Derivative', formula: "f'(x) = 3x^2 - 8x + 6" },
          { label: 'Critical Points', formula: '3x^2 - 8x + 6 = 0 \\implies \\Delta = (-8)^2 - 4(3)(6) = -8 < 0' },
        ],
      },
    };
  }

  // 5. Database Normalization
  if (text.includes('normalization') || text.includes('1nf') || text.includes('2nf') || text.includes('3nf') || text.includes('bcnf') || text.includes('foreign key')) {
    return {
      type: 'database_normalization',
      title: 'Relational Schema Normalization (3NF)',
      description: 'Decomposing non-key transitive dependencies into atomic relational tables with primary/foreign keys.',
      visualData: {
        unnormalized: 'Order(OrderID, CustomerID, CustomerName, ItemID, ItemName, Qty, Price)',
        normalizedTables: [
          { name: 'Customers', pKey: 'CustomerID', cols: ['Name', 'Email'] },
          { name: 'Products', pKey: 'ProductID', cols: ['Name', 'UnitPrice'] },
          { name: 'Orders', pKey: 'OrderID', cols: ['CustomerID', 'OrderDate'] },
          { name: 'OrderItems', pKey: '(OrderID, ProductID)', cols: ['Quantity', 'LineTotal'] },
        ],
      },
    };
  }

  return null;
}
