import Container from "../Shared/Container";
import CategoryBox from "./CategoryBox";
import { categories } from "./CategoryList";


const Categories = () => {
    return (
      <Container>
        <div className="p-5 flex item-center justify-between overflow-x-auto">
          {categories.map((category) => (
            <CategoryBox
              key={category.label}
              label={category.label}
              Icon={category.icon}
              description={category.description}
            ></CategoryBox>
          ))}
        </div>
      </Container>
    );
};

export default Categories;