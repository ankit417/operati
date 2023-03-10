import React from "react";

const sortOptions = [
  { label: "Name ASC", value: "name_asc" },
  { label: "Name DESC", value: "name_desc" },
  { label: "Area ASC", value: "area_asc" },
  { label: "Area DESC", value: "area_desc" },
];

const Controls = ({ sortOrder, setSortOrder }) => {
  return (
    <div className="controls_container">
      <Select
        label="Sort order"
        value={sortOrder}
        options={sortOptions}
        onChange={(event) => {
          setSortOrder(event.target.value);
        }}
      />
    </div>
  );
};

const Select = ({ label, value, options, onChange }) => {
  return (
    <label>
      {label}{" "}
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

//[todo: get only panel]
const calculateArea = (item, panelTypes) => {
  console.log("panel types ", panelTypes);
  let area = 0;
  let panels = item.panels.map(
    ([count, type]) =>
      count *
      (getHWofPanel(type, "height", panelTypes) *
        getHWofPanel(type, "width", panelTypes))
  );

  panels.map((item, index) => {
    return (area += item);
  });
  return area;
};

const checkColor = (item, panelTypes) => {
  let colors = item.map(([count, type]) => getColorType(type, panelTypes));
  // console.log("check colors",colors)
  let color = colors[0];
  colors.map((item, index) => {
    if (item != colors[0]) {
      color = "mixed";
    }
  });
  return color;
};

const getColorType = (panelType, panelTypes) => {
  const panel = panelTypes.filter((panel) => panel.name == panelType);
  if (panel.length > 0) {
    return panel[0].colour;
  }

  return "N/A";
};

const getHWofPanel = (panelType, HW, panelTypes) => {
  const panel = panelTypes.filter((panel) => panel.name == panelType);
  if (panel.length > 0) {
    return panel[0][HW];
  } else {
    return 0;
  }
};

const Table = ({ sort, panelTypes, panelOffers }) => {
  var sortedData = panelOffers;
  console.log("sorted data", sortedData);

  switch (sort) {
    case "name_asc":
      sortedData = sortedData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      sortedData = sortedData.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "area_asc":
      sortedData.map((item, index) => {
        let area = calculateArea(item, panelTypes);
        return (sortedData[index].area = area);
      });
      sortedData = sortedData.sort((a, b) =>
        a.area > b.area ? 1 : b.area > a.area ? -1 : 0
      );
      break;
    case "area_desc":
      sortedData.map((item, index) => {
        let area = calculateArea(item, panelTypes);
        return (sortedData[index].area = area);
      });
      sortedData = sortedData.sort((a, b) =>
        a.area < b.area ? 1 : b.area < a.area ? -1 : 0
      );
      break;
    default:
      return sortedData;
  }

  return (
    <table className="main_table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Panels</th>
          <th>Area </th>
          <th>Color </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>
              {item.panels
                .map(([count, type]) => count + " * " + type)
                .join(" + ")}
            </td>
            <td>{calculateArea(item, panelTypes)} </td>
            <td>{checkColor(item.panels, panelTypes)} </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const App = () => {
  const [sortOrder, setSortOrder] = React.useState("name_asc");
  const [panelOffers, setPanelOffers] = React.useState([]);
  const [panelTypes, setPanelTypes] = React.useState([]);

  React.useEffect(() => {
    getPanelOffers();
    getPanelTypes();
  }, []);

  const getPanelOffers = async () => {
    let currentPage = 1;
    let data = [];
    const response = await fetch(
      `https://panelsapi.figur.dev/panel_offers?page=${currentPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
    data = [...data, ...response.items];

    const totalData = Math.ceil(
      response.total_items_count / response.page_items_count
    );
    for (let i = 2; i < totalData; i++) {
      let res = await fetch(
        `https://panelsapi.figur.dev/panel_offers?page=${i}`
      )
        .then((res) => res.json())
        .then((data) => {
          return data;
        });
      data = [...data, ...res.items];
    }

    setPanelOffers(data);
  };

  const getPanelTypes = async () => {
    let currentPage = 1;
    let data = [];
    const response = await fetch(
      `https://panelsapi.figur.dev/panel_types?page=${currentPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
    data = [...data, ...response.items];

    const totalData = Math.ceil(
      response.total_items_count / response.page_items_count
    );
    for (let i = 2; i < totalData; i++) {
      let res = await fetch(`https://panelsapi.figur.dev/panel_types?page=${i}`)
        .then((res) => res.json())
        .then((data) => {
          return data;
        });
      data = [...data, ...res.items];
    }
    setPanelTypes(data);
  };

  return (
    <div className="container">
      <Controls sortOrder={sortOrder} setSortOrder={setSortOrder} />
      {panelOffers.length > 0 && panelTypes.length > 0 && (
        <Table
          sort={sortOrder}
          panelTypes={panelTypes}
          panelOffers={panelOffers}
        />
      )}
    </div>
  );
};
