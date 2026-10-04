//Get all the DOM elements... javascript works on the DOM (CSE_108)
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
let welcome = document.getElementById("greeting");
let attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const winnerMessage = document.getElementById("winnerMessage");
const maxReached = document.getElementById("weDidIt");

//Track attendence
let count = 0;
const maxCount = 50;
const attendanceStorageKey = "eventAttendance";

function saveAttendance() {
    const attendance = {
        total: count,
        water: parseInt(document.getElementById("waterCount").textContent),
        zero: parseInt(document.getElementById("zeroCount").textContent),
        power: parseInt(document.getElementById("powerCount").textContent),
        waterNames: getAttendeeNames("water"),
        zeroNames: getAttendeeNames("zero"),
        powerNames: getAttendeeNames("power")
    };

    localStorage.setItem(attendanceStorageKey, JSON.stringify(attendance));
}

function getAttendeeNames(team) {
    const attendeeList = document.getElementById(team + "Attendees");
    const attendeeElements = attendeeList.querySelectorAll(".attendee-name");
    const names = [];

    attendeeElements.forEach(function(attendee) {
        names.push(attendee.textContent);
    });

    return names;
}

function displayAttendeeNames(team, names) {
    const attendeeList = document.getElementById(team + "Attendees");

    names.forEach(function(name) {
        const attendee = document.createElement("p");
        attendee.classList.add("attendee-name", team + "-attendee");
        attendee.textContent = name;
        attendeeList.appendChild(attendee);
    });
}

function loadAttendance() {
    const savedAttendance = localStorage.getItem(attendanceStorageKey);

    if (savedAttendance === null) {
        return;
    }

    try {
        const attendance = JSON.parse(savedAttendance);
        count = attendance.total;
        attendeeCount.textContent = count;
        document.getElementById("waterCount").textContent = attendance.water;
        document.getElementById("zeroCount").textContent = attendance.zero;
        document.getElementById("powerCount").textContent = attendance.power;
        progressBar.style.width = (count / maxCount) * 100 + "%";
        displayAttendeeNames("water", attendance.waterNames || []);
        displayAttendeeNames("zero", attendance.zeroNames || []);
        displayAttendeeNames("power", attendance.powerNames || []);
    }
    catch (error) {
        console.error("Unable to load saved attendance.", error);
    }
}

loadAttendance();

function startConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.classList.add("confetti-container");

    const colors = ["#0071c5", "#00c7fd", "#7cc242", "#ffc20e", "#f97316"];

    for (let index = 0; index < 80; index++) {
        const piece = document.createElement("span");
        piece.classList.add("confetti-piece");
        piece.style.backgroundColor = colors[index % colors.length];
        piece.style.left = Math.random() * 100 + "%";
        piece.style.animationDelay = Math.random() * 0.5 + "s";
        piece.style.animationDuration = 2 + Math.random() * 2 + "s";
        confettiContainer.appendChild(piece);
    }

    document.body.appendChild(confettiContainer);

    setTimeout(function() {
        confettiContainer.remove();
    }, 5000);
}

// hande form submission
form.addEventListener("submit", function(event) {
    event.preventDefault(); // to avoid page refresh on submit form

    if (count >= maxCount) {
        maxReached.currentTime = 0;
        maxReached.play();
        startConfetti();
        return;
    }

    const name = nameInput.value;
    const team = teamSelect.value;
    const teamName = teamSelect.selectedOptions[0].text;

    // Increment count for each form submit
    count++;
    attendeeCount.textContent = count;
    progressBar.style.width = (count / maxCount) * 100 + "%";

    // Update team counter
    const teamCounter = document.getElementById(team + "Count");
    teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

    // Add the attendee's name to their team
    const attendeeList = document.getElementById(team + "Attendees");
    const attendee = document.createElement("p");
    attendee.classList.add("attendee-name", team + "-attendee");
    attendee.textContent = name;
    attendeeList.appendChild(attendee);
    saveAttendance();

    // Display welcome message
    const message = `👋 Welcome, ${name} from ${teamName}`;
    welcome.textContent = message;
    welcome.classList.add("success-message");
    welcome.style.display = "block";

    if (count < maxCount) {
        // Comment out the line to test for winning functionality...
        form.reset();
        return;
    }
    else {
        const waterCount = parseInt(
            document.getElementById("waterCount").textContent
        );
        const zeroCount = parseInt(
            document.getElementById("zeroCount").textContent
        );
        const powerCount = parseInt(
            document.getElementById("powerCount").textContent
        );

        let winningTeam = "Team Water Wise";
        let winningKey = "water";
        let winningCount = waterCount;

        if (zeroCount > winningCount) {
            winningTeam = "Team Net Zero";
            winningKey = "zero";
            winningCount = zeroCount;
        }

        if (powerCount > winningCount) {
            winningTeam = "Team Renewables";
            winningKey = "power";
            winningCount = powerCount;
        }

        const winningCard = document.querySelector(".team-card." + winningKey);
        winningCard.classList.add("winning-team");

        winnerMessage.textContent =
            `🎉 Congratulations to ${winningTeam} with ${winningCount} attendees! 🎉`;
        winnerMessage.style.display = "block";
        maxReached.currentTime = 0;
        maxReached.play();
        startConfetti();
    }
});