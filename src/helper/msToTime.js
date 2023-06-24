const msToTime = (ms) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const givenDate = new Date(ms);
    const day = days[givenDate.getDay()];
    let date = givenDate.getDate();
    date = date < 10 ? '0' + date : date;
    let month = givenDate.getMonth();
    const monthName = months[month];
    month = month < 9 ? '0' + (month + 1) : month + 1;
    const year = givenDate.getFullYear();

    let hours = givenDate.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    let minutes = givenDate.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const sendingTime = hours + ':' + minutes;
    const sendingDate = date + '/' + month + '/' + year;
    const dayAndDate = day + ', ' + date + ' ' + monthName + ' ' + year;

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
    let result;

    if (sendingDate === today) {
        result = 'today';
    } else if (sendingDate === yesterday) {
        result = 'yesterday';
    } else {
        result = sendingDate;
    };

    return { result, sendingTime, sendingDate, dayAndDate };
};

export default msToTime;