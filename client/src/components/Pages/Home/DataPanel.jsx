function DataPanel(props) {
  const { title, value, unit } = props;
  return (
    <div className="bg-white shadow-sm shadow-gray-400 flex flex-col items-center justify-center rounded-md p-2">
      <p>{title}</p>
      <p className="font-bold">
        {value} {unit}
      </p>
      {/* <a href="#" className="text-gray-400 hover:underline hover:text-blue-500">
        anos anteriores
      </a> */}
    </div>
  );
}

export default DataPanel;
