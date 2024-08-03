import { Link } from 'react-router-dom'
import Container from '../Container'
import logoImg from '../../../assets/images/travelBook_logo.png'
import MenuDropdown from './MenuDropdown'

const Navbar = () => {
  return (
    <div className='fixed w-full bg-white z-10 shadow-sm'>
      <div className='py-4 border-b-[1px]'>
        <Container>
          <div className='flex flex-row  items-center justify-between gap-3 md:gap-0'>
            {/* Logo */}
            <Link to='/'>
              <img
                className='md:block'
                src={logoImg}
                alt='logo'
                width='180'
                height='180'
              />
            </Link>
            {/* Dropdown Menu */}
            <MenuDropdown />
          </div>
        </Container>
      </div>
    </div>
  )
}

export default Navbar
