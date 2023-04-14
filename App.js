import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { ActivityIndicator, Dimensions } from "react-native";
import { Fontisto } from "@expo/vector-icons";

import styled from "styled-components/native";

import { WEATHER_API_KEY } from "@env";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [city, setCity] = useState("...Loading");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    setCity(location[0].region);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const json = await response.json();

    setDays(json.list);
  };

  useEffect(() => {
    getWeather();
  }, []);

  const icons = {
    Clouds: "cloudy",
    Rain: "rain",
    Clear: "day-sunny",
    Snow: "snow",
    Drizzle: "rains",
    Thunderstorm: "lightning",
    Atmosphere: "cloudy-gusts",
  };
  return (
    <Container>
      <LocationView>
        <LocationText>{days.length === 0 ? "Loading..." : city.toUpperCase()}</LocationText>
      </LocationView>
      <ForecastView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {days.length === 0 ? (
          <LoadingView>
            <ActivityIndicator color="white" size="large" />
          </LoadingView>
        ) : (
          days.map((list, index) => (
            <DayForecastView key={index}>
              <IconSection>
                <Fontisto name={icons[list.weather[0].main]} size={300} color="black" />
              </IconSection>
              <TempSection>
                <TempText>{parseFloat(list.main.temp).toFixed(1)}</TempText>
              </TempSection>
              <DescriptText>{list.weather[0].main}</DescriptText>
              <SubDescriptText>{list.weather[0].description}</SubDescriptText>
            </DayForecastView>
          ))
        )}
      </ForecastView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #ffbf00;
`;

const LocationView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
`;

const LocationText = styled.Text`
  font-size: 70px;
  font-weight: 800;
  color: black;
  opacity: 0.7;
`;

const ForecastView = styled.ScrollView`
  flex: 2.5;
  margin-top: 30px;
`;

const LoadingView = styled.View`
  width: ${SCREEN_WIDTH};
  margin-top: 100px;
`;

const DayForecastView = styled.View`
  width: ${SCREEN_WIDTH};
  flex: 1;
  align-items: flex-start;
  padding: 0 40px;
`;

const IconSection = styled.View`
  width: ${SCREEN_WIDTH};
  position: absolute;
  left: 70px;
  top: 60px;
  opacity: 0.15;
  overflow: hidden;
`;

const TempSection = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TempText = styled.Text`
  font-size: 90px;
`;

const DescriptText = styled.Text`
  font-size: 30px;
  font-weight: 400;
  margin-top: -10px;
`;

const SubDescriptText = styled.Text`
  font-size: 18px;
  font-weight: 300;
`;
