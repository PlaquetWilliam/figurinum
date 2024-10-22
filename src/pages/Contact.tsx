import { CiMail, CiPhone } from "react-icons/ci";
import { FiChevronDown } from "react-icons/fi";
import { useState } from "react";

import { Footer } from "../components/Footer"

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Quels types de figurines vendez-vous ?",
    answer:
      "Nous proposons une large gamme de figurines allant des personnages de films, de jeux vidéo, aux modèles personnalisés en 3D. Que vous soyez un fan de science-fiction ou de fantasy, vous trouverez sûrement une figurine qui vous correspond.",
  },
  {
    question: "Est-il possible de commander des modèles 3D personnalisés ?",
    answer:
      "Oui, nous offrons un service de modélisation 3D personnalisée pour répondre à vos besoins spécifiques. Vous pouvez envoyer une description détaillée ou un croquis, et notre équipe se chargera de créer un modèle unique.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les délais de livraison varient en fonction de la disponibilité du produit et de la destination. En général, les produits en stock sont expédiés sous 3 à 5 jours ouvrables.",
  },
  {
    question: "Quels matériaux utilisez-vous pour les figurines ?",
    answer:
      "Nous utilisons divers matériaux de haute qualité comme la résine, le plastique et même certains métaux selon le type de figurine. Chaque matériau est sélectionné pour garantir un niveau de détail optimal et une longue durabilité.",
  },
];

export const Contact = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main>
        <section className="flex flex-col items-center py-20">
            <h1 className="mb-6 text-7xl font-montserrat uppercase">Contacter-nous</h1>
            <p className="text-2xl font-montserrat">Nous sommes disponibles 7 jours sur 7.</p>
        </section>

        <section className="flex justify-evenly py-20 border-y">
            <div className="flex flex-col items-center">
                <CiPhone className="mb-4 text-6xl" />
                <h1 className="font-bold text-xl font-montserrat">Par téléphone</h1>
                <p>Appelez-nous au : 06 00 00 00 00</p>
            </div>

            <div className="flex flex-col items-center">
                <CiMail className="mb-4 text-6xl" />
                <h1 className="font-bold text-xl font-montserrat">Par mail</h1>
                <p>Écrivez-nous sur l'adresse : figurinum@contact.fr</p>
            </div>
        </section>

        <section className="flex flex-col items-center py-20">
            <h1 className="mb-6 text-7xl font-montserrat uppercase">FAQ</h1>
            <div className="w-1/2">
                {faqData.map((faq, index) => (
                    <div key={index} className="mb-4">
                        <button className="w-full text-left py-4 px-6 bg-gray-200 hover:bg-gray-300 focus:outline-none transition-colors duration-300 flex justify-between items-center" onClick={() => toggleAnswer(index)}>
                            <span className="text-xl font-montserrat">{faq.question}</span>
                            <FiChevronDown className={`transition-transform duration-300 ${ openIndex === index ? "transform rotate-180" : "" }`}/>
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${ openIndex === index ? "max-h-96" : "max-h-0" }`} style={{ maxHeight: openIndex === index ? `${faq.answer.length * 1.5}px` : "0px", }}>
                            <p className="p-6 font-montserrat bg-gray-100">{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <Footer/>
    </main>
  );
};