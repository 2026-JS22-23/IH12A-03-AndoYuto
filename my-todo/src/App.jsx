// src/App.jsx
function TodoItem({ text }) { // 部品＝HTMLを返す関数
return <li>{text}</li>; // { } の中はJSの式
}
export default function App() {
const items = ['牛乳を買う', 'レポート提出'];
return (
<ul>
{items.map((t, i) => <TodoItem key={i} text={t} />)}
</ul>
);
}

