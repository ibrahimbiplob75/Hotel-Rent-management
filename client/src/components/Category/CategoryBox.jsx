import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import queryString from "query-string";
import qs from "query-string"

const CategoryBox = ({ label, Icon, description,active }) => {
    const [params, setParams] = useSearchParams();
     
    
    const navigate = useNavigate();
    const handleClick = () => {
      
      let currentQuery = {};
      if(params){
        currentQuery=qs.parse(params.toString());
      }
      const updateQury={...currentQuery,category:label}
      
      const url = queryString.stringifyUrl({
        url: "/",
        query: updateQury,
      });
      navigate(url);
    };
    params.get("category");
  
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