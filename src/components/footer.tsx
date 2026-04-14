import { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

interface ISocialMediaButton {
    icon: IconType;
    url: string;
    label: string;
}

function SocialMediaLi({ icon, url, label } : ISocialMediaButton) {
    return <li>
        <a aria-label={label} href={url} target="_blank" rel="noopener noreferrer">
            {icon({ size: 24 })}
        </a>
    </li>
}

export function Footer() {
    return <footer className="flex flex-col mx-4 md:mx-8 border-t pt-4 px-2 md:px-8">
        <div className="flex justify-between">
            <div className="flex flex-col gap-16">
                <h2 className="font-bold text-2xl">IME Jr</h2>
                <ul className="flex gap-4">
                    <SocialMediaLi icon={FaFacebook} url="https://www.facebook.com/IMEJuniorUSP" label="Facebook" />
                    <SocialMediaLi icon={FaInstagram} url="https://www.instagram.com/imejr.usp" label="Instagram" />
                    <SocialMediaLi icon={FaLinkedin} url="https://www.linkedin.com/company/imejr" label="Linkedin" />
                    <SocialMediaLi icon={FaYoutube} url="https://www.youtube.com/@imejr7112" label="Youtube" />
                </ul>
            </div>
            <div>
                <h2 className="text-xl font-bold">Contatos</h2>
                <p>contato@imejr.com | +55 11 11 3091-6241 | R. do Matão, 1010 - Cidade Universitária, São Paulo</p>
                <p>CNPJ: 26.531.013/0001-80</p>
            </div>
        </div>
        <div className="text-center text-sm mt-8">
            <p>Todos os direitos reservados &reg; Empresa Júnior de Informática, Matemática e Estatística, 2026</p>
        </div>
    </footer>;
}