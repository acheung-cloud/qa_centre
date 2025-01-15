import Logo from "./nstrlabs-logo-w-name.png";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className=" p-0">
            <Image 
                src={Logo}
                alt='Dojo Logo'
                height={60}
                quality={100}
                placeholder='blur'
            />
        </nav>
    );
}