export interface Item {
  id: string;
  label: string;
  wbs: string;
  children: Item[];
}