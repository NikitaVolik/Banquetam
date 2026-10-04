// client/src/components/common/HeroSlider.jsx

import { useEffect, useState } from "react";

const slides = [
    '/images/unnamed.webp',
    '/images/None-106945.webp',
    '/images/SYketSiveYo4LvDWfurQC04VAx9udTX7kYVfO.webp',
    '/images/1686676944_elles-top-p-letnyaya-ploshcha.webp'
]

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    return (
        <section className="hero-slider" aria-label="Галерея банкетных помещений">
            <div className="container">
                <div className="hero-slider-shell">
                    <button
                        type="button"
                        className="hero-slider-btn hero-slider-btn-left"
                        onClick={prevSlide}
                        aria-label="Предыдущий слайд"
                    >
                        ‹
                    </button>

                    <div className="hero-slider-window">
                        <div className="hero-slider-track" style={{
                            transform: `translateX(-${currentSlide * 100}%)`
                        }}>
                            {slides.map((slide, index) => (
                                <div key={slide} className="hero-slide" aria-hidden={index != currentSlide}>
                                    <img src={slide} alt={`Банкетное помещение ${index + 1}`} width="1600" height="900" loading="lazy" />
                                </div>
                            ))} 
                        </div>
                    </div>

                    <button
                        type="button"
                        className="hero-slider-btn hero-slider-btn-right"
                        onClick={nextSlide}
                        aria-label="Следующий слайд"
                    >
                        ›
                    </button>
                </div>
            </div>
        </section>
    )
}