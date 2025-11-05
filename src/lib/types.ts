export interface BmltChange {
  change_id: string;
  user_name: string;
  date_string: string;
  date_int: number;
  change_type: string;
  meeting_name?: string;
  service_body_name?: string;
  json_data?: string | { before?: { meeting_name?: string }; after?: { meeting_name?: string } };
}

export interface Config {
  bmltServer: string;
  serviceBodyId: string;
  daysPassed: number;
  timezone: string;
}

export interface BmltServer {
  id: string;
  name: string;
  url: string;
}

export interface ServiceBody {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
}

export interface ChangesByUser {
  [userName: string]: BmltChange[];
}

export interface ChangeTypeStats {
  [changeType: string]: number;
}

export type ChangeType = 'change' | 'new' | 'delete' | 'rollback' | '';
