function App() {

  let count = 0;

  // 카운트 증가 이벤트
  const upCount = () => {
    count = count + 1;
    console.log(count);
  } 
  
  return (
    <>
      <p>{count}</p>
      <button type="button" onClick={upCount}>증가</button>
    </>
  )
}

export default App
