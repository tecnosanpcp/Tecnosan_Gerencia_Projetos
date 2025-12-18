export default function StatusButton({ status }) {
  let style_button = "";

  switch (status) {
    case "Pending":   style_button = "bg-blue-500";   break;
    case "Completed": style_button = "bg-green-500";  break;
    case "Running":   style_button = "bg-yellow-500"; break;
    case "Delayed":   style_button = "bg-orange-500"; break;
    case "Failed":    style_button = "bg-red-500";    break;
    default:          style_button = "bg-gray-300";
  }

  // h-full garante que a cor preencha a altura da linha da tabela
  return <div className={`${style_button} w-full h-full min-h-[20px] shadow-sm`}></div>;
}