import {ApiResponseDTO} from "../service/dto/api-response.dto";
import {join} from "path";

export const generateResp = (success: boolean, code?: number, message?: any) => {

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

export const generatePath = (shouldFullPath, ...paths: string[]) => {
  if (shouldFullPath) {
    return join(__dirname, '..', '..', 'public', 'images', ...paths);
  }
  return join('/','images', ...paths)
}
