export interface IDataQR {
  id: string;
  qr: string;
  success: boolean;
  message: string;
}

export interface IStatusQR {
  id: number;
  statusId: number;
  expirationDate: string;
  voucherId: string;
  success: boolean;
  message: string;
}
