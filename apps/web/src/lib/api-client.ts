// T-003: Web API Client typed with @verdescan/shared contracts
import {
  CreateDiagnosisReq,
  CreateDiagnosisRes,
  SubmitDiagnosisReq,
  SubmitDiagnosisRes,
  AnswerFollowUpReq,
  SearchGuidesReq,
  ERROR_CODES,
  type AppErrorCode,
} from '@verdescan/shared';

export interface ApiClientOptions {
  functionsBaseUrl?: string;
  appCheckToken?: string;
}

export class VerdeScanApiClient {
  private baseUrl: string;

  constructor(options?: ApiClientOptions) {
    this.baseUrl = options?.functionsBaseUrl || '';
  }

  // Validate outgoing CreateDiagnosisReq payload against shared schema
  validateCreateDiagnosisReq(payload: unknown): CreateDiagnosisReq {
    return CreateDiagnosisReq.parse(payload);
  }

  // Validate incoming CreateDiagnosisRes payload against shared schema
  validateCreateDiagnosisRes(response: unknown): CreateDiagnosisRes {
    return CreateDiagnosisRes.parse(response);
  }

  // Validate outgoing SubmitDiagnosisReq payload
  validateSubmitDiagnosisReq(payload: unknown): SubmitDiagnosisReq {
    return SubmitDiagnosisReq.parse(payload);
  }

  // Validate incoming SubmitDiagnosisRes payload
  validateSubmitDiagnosisRes(response: unknown): SubmitDiagnosisRes {
    return SubmitDiagnosisRes.parse(response);
  }

  // Validate answer follow-up
  validateAnswerFollowUpReq(payload: unknown): AnswerFollowUpReq {
    return AnswerFollowUpReq.parse(payload);
  }

  // Validate guide search request
  validateSearchGuidesReq(payload: unknown): SearchGuidesReq {
    return SearchGuidesReq.parse(payload);
  }

  getErrorCode(code: string): AppErrorCode {
    return (code in ERROR_CODES ? code : 'INTERNAL') as AppErrorCode;
  }
}

export const apiClient = new VerdeScanApiClient();
