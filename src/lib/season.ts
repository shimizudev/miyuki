export const getCurrentSeason = () => {
	const month = new Date().getMonth();
	const season = month < 3 ? "WINTER" : month < 6 ? "SPRING" : month < 9 ? "SUMMER" : "FALL";
	return season;
};
