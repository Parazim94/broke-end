interface IHistory {
  total?: number;
  date?: Date;
}

interface ITradeHistory {
  symbol: string;
  price: number;
  amount: number;
  order?: boolean;
  date?: Date;
}

interface IDisplayedTools {
  chatAi: boolean;
  tutorial: boolean;
  quiz: boolean;
}

export interface IUser {
  _id: string;
  userName?: string;
  email: string;
  method?: string;
  oldEmail?: string;
  password: string;
  age: number;
  isVerified: boolean;
  hashedPW: string;
  newPW?: string;
  cash: number;
  history: IHistory[];
  positions?: { [symbol: string]: number };
  favorites: string[];
  prefTheme: string[];
  tradeHistory: ITradeHistory[];
  displayedTools: IDisplayedTools;
  icon?: string;
  iconColor?: string;
  createdAt?: Date; // automatically managed by Mongoose with timestamps
  updatedAt?: Date; // automatically managed by Mongoose with timestamps
}
