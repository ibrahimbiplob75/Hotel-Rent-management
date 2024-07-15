import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import queryString from "query-string";

const CategoryBox = ({ label, Icon, description,active }) => {
    const [params, setParams] = useSearchParams();
    const category = params.get("category");
     console.log(active)
    const navigate = useNavigate();
    const handleClick = () => {
      
      let currentQuery = { category: label };
      // console.log(currentQuery);
      const url = queryString.stringifyUrl({
        url: "/",
        query: currentQuery,
      });
      // url output---> /?category=label

      // 2. Set query string in url
      navigate(url);
    };
  
  return (
    <div
      onClick={handleClick}
      className={`flex 
    flex-col 
    items-center 
    justify-center 
    gap-2
    p-3
    border-b-2
   hover:text-neutral-800
    transition
    cursor-pointer 
    ${active ? "border-b-neutral-800 text-neutral-800" : ""}
    `}
    >
      <Icon size={26} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

export default CategoryBox;