import { Item } from "../types";

export const initialData: Item[] = [
  {
    id: '1',
    label: 'A',
    wbs: '1',
    children: [
      { id: '1.1', label: 'A1', wbs: '1.1', children: [] },
      { id: '1.2', label: 'A2', wbs: '1.2', children: [] },
      { id: '1.3', label: 'A3', wbs: '1.3', children: [] },
    ],
  },
  {
    id: '2',
    label: 'B',
    wbs: '2',
    children: [
      { id: '2.1', label: 'B1', wbs: '2.1', children: [] },
      { id: '2.2', label: 'B2', wbs: '2.2', children: [] },
    ],
  },
  {
    id: '3',
    label: 'C',
    wbs: '3',
    children: [
      { id: '3.1', label: 'C1', wbs: '3.1', children: [] },
    ],
  },
];
