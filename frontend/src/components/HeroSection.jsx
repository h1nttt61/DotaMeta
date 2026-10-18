import Button from "./Button";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";


function HeroSection() {
    const {
        theme,
        isTransitioning,
    } = useTheme();


    return (
        <section
            className={`hero ${
                isTransitioning
                    ? "hero--transitioning"
                    : ""
            }`}
        >


            <div
                className={`requiem-effect ${
                    isTransitioning
                        ? "requiem-effect--active"
                        : ""
                }`}
            >

                <div className="requiem-effect__ring" />

                <div
                    className="
                        requiem-effect__ring
                        requiem-effect__ring--two
                    "
                />

                <div className="requiem-effect__flash" />


                <div className="requiem-effect__particles">

                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />

                </div>

            </div>



            <div className="hero__glow" />


            <div className="hero__content">

                <span className="hero__eyebrow">
                    DOTA 2 META ANALYTICS
                </span>


                <h1>
                    Начни уже играть в доту!
                    <br />
                    <span>
                        Бери метовых персонажей
                    </span>
                </h1>


                <p>
                    Анализируй героев, винрейты и
                    текущую мету Dota 2
                    в одном месте.
                </p>


                <div className="hero__actions">

                    <Link to="/meta">
                        <Button>
                            Смотреть мету
                        </Button>
                    </Link>


                    <Link to="/heroes">
                        <Button variant="secondary">
                            Герои
                        </Button>
                    </Link>

                </div>


                <div className="hero__patch">

                    <span>
                        CURRENT PATCH
                    </span>

                    <strong>
                        7.41f
                    </strong>

                </div>

            </div>



            <div className="hero__visual">

                <div className="hero__image-glow" />


                <img
                    src="/images/sf.jpg"
                    alt="Shadow Fiend Dark"
                    className={`
                        hero__image
                        hero__image--dark
                        ${
                        theme === "dark"
                            ? "hero__image--visible"
                            : ""
                    }
                    `}
                />

                <img
                    src="/images/sf-light.jpg"
                    alt="Shadow Fiend Light"
                    className={`
                        hero__image
                        hero__image--light
                        ${
                        theme === "light"
                            ? "hero__image--visible"
                            : ""
                    }
                    `}
                />

            </div>

        </section>
    );
}


export default HeroSection;