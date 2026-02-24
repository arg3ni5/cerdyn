
import styled from "styled-components";
import {
  EffectCards,
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FC, useRef } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/effect-cards";
import img1 from "../../assets/Ruleta/ruleta9.png";
import img2 from "../../assets/Ruleta/ruleta8.png";
import img3 from "../../assets/Ruleta/ruleta5.png";
import img4 from "../../assets/Ruleta/ruleta6.png";
import img5 from "../../assets/Ruleta/ruleta7.png";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export const Carousel: FC = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <CarouselContainer>

      <div className="custom-button-prev" ref={prevRef}>
        <IoIosArrowBack />
      </div>
      <div className="custom-button-next" ref={nextRef}>
        <IoIosArrowForward />
      </div>

      <Swiper
        autoplay={{ delay: 1500, disableOnInteraction: false }}
        modules={[
          EffectCards,
          Navigation,
          Pagination,
          Scrollbar,
          A11y,
          Autoplay,
        ]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          const navigation = swiper.params.navigation as any;
          navigation.prevEl = prevRef.current;
          navigation.nextEl = nextRef.current;

          swiper.navigation.init();
          swiper.navigation.update();
        }}

        pagination={{ type: "fraction" }}
        scrollbar={{ draggable: true }}
        effect={"cards"}
      >
        {[img1, img2, img3, img4, img5].map((img, i) => (
          <SwiperSlide key={i}>
            <img src={img} alt={`slide-${i + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>

    </CarouselContainer>
  );
}
const CarouselContainer = styled.div`
  position: relative;
  width: 20vw;
  height: 50vh;
  min-width: 220px;

  @media (max-width: 70em) {
    height: 40vh;
    padding: 15px 0;
  }
  @media (max-width: 64em) {
    height: 50vh;
    width: 30vw;
  }
  @media (max-width: 48em) {
    height: 35vh;
    width: 40vw;
  }
  @media (max-width: 30em) {
    height: 35vh;
    width: 40vw;
  }

  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    img {
      display: block;
      height: 100%;
      object-fit: contain;
    }
  }

  .swiper-pagination-fraction {
    color: ${(props) => props.theme.text};
    font-size: 1.5rem;
    font-weight: 600;
  }

  .custom-button-prev,
  .custom-button-next {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.bgtotal};
    cursor: pointer;
    z-index: 9;

    background: ${(props) => props.theme.text};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    background-position: center;
    background-size: cover;

    &:after {
      display: none;
    }

    svg {
      font-size: 22px;
    }
  }

  .custom-button-prev {
    left: 0;
  }

  .custom-button-next {
    right: 0;
  }
`;
