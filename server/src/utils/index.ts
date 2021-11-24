import {ApiResponseDTO} from "../service/dto/api-response.dto";

export const generateResp = (success: boolean, code?: number, message?: string) => {

  const resp = new ApiResponseDTO();
  if (success) {
    resp.code = 200
  } else {
    resp.code = 500
  }
  if (message)
    resp.message = message;

  return resp;
}
