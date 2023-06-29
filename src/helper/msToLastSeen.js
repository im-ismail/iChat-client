// function to find out user last seen
const lastSeen = (ms) => {
    const activeOn = new Date(ms);
    let date = activeOn.getDate();
    date = date < 10 ? '0' + date : date;
    let month = activeOn.getMonth();
    month = month < 9 ? '0' + (month + 1) : month + 1;
    const year = activeOn.getFullYear();

    let hours = activeOn.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    let minutes = activeOn.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const activeTime = hours + ':' + minutes;
    const activeDate = date + '/' + month + '/' + year;

    const currentDate = new Date();
    let todaysDate = currentDate.getDate();
    let YesterdaysDate = todaysDate - 1;
    todaysDate = todaysDate < 10 ? '0' + todaysDate : todaysDate;
    YesterdaysDate = YesterdaysDate < 10 ? '0' + YesterdaysDate : YesterdaysDate;
    let currentMonth = currentDate.getMonth();
    currentMonth = currentMonth < 9 ? '0' + (currentMonth + 1) : currentMonth + 1;
    let currentyear = currentDate.getFullYear();
    const today = todaysDate + '/' + currentMonth + '/' + currentyear;
    const yesterday = YesterdaysDate + '/' + currentMonth + '/' + currentyear;

    let lastSeenText = '';

    if (activeDate === today) {
        lastSeenText = `today at ${activeTime}`;
    } else if (activeDate === yesterday) {
        lastSeenText = `yesterday at ${activeTime}`;
    } else {
        lastSeenText = `${activeDate} at ${activeTime}`;
    };
    return `Last seen ${lastSeenText}`;
};

export default lastSeen;