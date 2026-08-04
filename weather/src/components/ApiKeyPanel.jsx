import { useState } from 'react'
import neon from '../styles/neon.module.css'
import styles from './ApiKeyPanel.module.css'

export default function ApiKeyPanel({
  apiKeyInput,
  onChangeApiKeyInput,
  onSave,
  onClear,
  hasStoredKey,
  isUsingEnvDefault,
}) {
  const [visible, setVisible] = useState(false)

  let statusText = 'API Key가 설정되지 않았습니다. 아래 입력창에 입력 후 저장해주세요.'
  if (hasStoredKey) {
    statusText = '저장된 API Key를 사용합니다.'
  } else if (isUsingEnvDefault) {
    statusText = '.env 파일의 기본 API Key를 사용합니다.'
  }

  return (
    <section className={`${neon.panel} w-full p-4 sm:p-5`}>
      <label htmlFor="api-key" className={neon.label}>
        API KEY
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          className={`${neon.input} min-w-0 flex-1`}
          value={apiKeyInput}
          onChange={(e) => onChangeApiKeyInput(e.target.value)}
          placeholder="OpenWeatherMap API Key 입력"
          autoComplete="off"
        />
        <button type="button" className={neon.button} onClick={() => setVisible((v) => !v)}>
          {visible ? '숨기기' : '표시'}
        </button>
        <button type="button" className={neon.button} onClick={onSave}>
          저장
        </button>
        <button type="button" className={neon.ghostButton} onClick={onClear}>
          초기화
        </button>
      </div>
      <p className={styles.status}>{statusText}</p>
    </section>
  )
}
