const DEFAULT_MESSAGE = '요청을 처리하는 중 오류가 발생했습니다.'

// api 가 던진 에러를 화면에 그대로 보여줄 수 있는 문장으로 바꾼다.
export const toErrorMessage = (error) =>
  error?.response?.data?.message ?? error?.message ?? DEFAULT_MESSAGE

export const statusOf = (error) => error?.response?.status ?? null
