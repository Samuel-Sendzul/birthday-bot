export type Section = {
  title: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
};
