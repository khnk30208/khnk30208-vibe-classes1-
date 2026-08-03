import { useState } from "react";

function App2() {
  //리액트에서 금지
  //상태변경에 따라 화면이 다시 그려지면 초기화 됨
  let count = 0;
  const [num, setNum] = useState(0);
  // 카운트 증가 이벤트
  const upCount = () => {
    // eslint-disable-next-line react-hooks/immutability -- 일반 변수 재할당이 렌더링에 반영되지 않음을 보여주는 의도된 예제
    count = count + 1;
    console.log(count);
  }
   // 카운트 증가 이벤트
  const upCount2 = () => {
    let newCnt = count + 1;
    setNum(newCnt);
    console.log(newCnt);
  }
  
  return (
    <>
      <p>{count}</p>
      <p>{num}</p>
      {/* eslint-disable-next-line react-hooks/immutability -- 위 예제와 동일한 이유로 억제 */}
      <button type="button" onClick={upCount}>증가</button>
      <button type="button" onClick={upCount2}>증가</button>
    </>
  )
}

export default App2
