const sidebar = document.getElementById('sidebar');
const sidebarBox = document.getElementById('sidebar-box');

let isSidebarOpen = false

sidebarBox.addEventListener("click", () => {
    if (isSidebarOpen) {
        sidebar.style.left = `-${sidebar.offsetWidth}px`;
        isSidebarOpen = false;
    }
    else {
        sidebar.style.left = "0";
        isSidebarOpen = true;
    }
});

function glow (element, color, offsetX, offsetY, blurRadius) {
    element.style['boxShadow'] = `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`;
    setTimeout(() => {
        element.style['boxShadow'] = 'none';
    }, 1000);
}