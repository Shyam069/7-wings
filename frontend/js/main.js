document.addEventListener("DOMContentLoaded", () => {

    /* ================= NOTIFICATION PERMISSION ================= */

    const requestNotificationPermission = async () => {
        if ("Notification" in window && Notification.permission === "default") {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.log("Notification permission unavailable.");
            }
        }
    };

    document.addEventListener("click", requestNotificationPermission, {
        once: true
    });


    /* ================= TASK REMINDER SYSTEM ================= */

    window.scheduleTaskReminder = function(task) {

        if (!task.reminder || !task.dueDate) return;

        const due = new Date(task.dueDate).getTime();
        const now = Date.now();

        const reminderTimes = {
            "1day": 24 * 60 * 60 * 1000,
            "6hours": 6 * 60 * 60 * 1000,
            "1hour": 60 * 60 * 1000
        };

        const reminderOffset = reminderTimes[task.reminder];

        if (!reminderOffset) return;

        const reminderTime = due - reminderOffset;
        const delay = reminderTime - now;

        if (delay <= 0) return;

        setTimeout(() => {

            if ("Notification" in window &&
                Notification.permission === "granted") {

                new Notification("7 WINGS Reminder", {
                    body: `${task.title} is coming up.`,
                    icon: "../assets/icons/icon.png"
                });

            } else {

                alert(`7 WINGS Reminder: ${task.title}`);

            }

        }, delay);
    };


    /* ================= RESUME ================= */

    const resumeForm = document.querySelector("#resumeForm");

    if (resumeForm) {
        resumeForm.addEventListener("input", () => {
            if (typeof updateResumePreview === "function") {
                updateResumePreview();
            }
        });
    }


    /* ================= SMOOTH LINKS ================= */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const id = link.getAttribute("href");

            if (!id || id === "#") return;

            const target = document.querySelector(id);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });

});