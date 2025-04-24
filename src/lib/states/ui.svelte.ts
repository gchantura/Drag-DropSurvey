/* let sidebarWidth = $state(300); // Initiale Breite in px
let startX = $state(0);
let startWidth = $state(0);
let sidebarEl: HTMLDivElement;


function handleResizeStart(event: MouseEvent | TouchEvent) {
    const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;

    startX = clientX;
    startWidth = sidebarWidth;

    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('touchmove', handleResizing, { passive: false });

    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchend', handleResizeEnd);
}

function handleResizing(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
    const newWidth = startWidth + (clientX - startX);

    if (newWidth > 200 && newWidth < 800) {
        sidebarWidth = newWidth;
    }
}

function handleResizeEnd() {
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('touchmove', handleResizing);

    window.removeEventListener('mouseup', handleResizeEnd);
    window.removeEventListener('touchend', handleResizeEnd);
} function handleResizeStart(event: MouseEvent | TouchEvent) {
    const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;

    startX = clientX;
    startWidth = sidebarWidth;

    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('touchmove', handleResizing, { passive: false });

    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchend', handleResizeEnd);
}

function handleResizing(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
    const newWidth = startWidth + (clientX - startX);

    if (newWidth > 200 && newWidth < 800) {
        sidebarWidth = newWidth;
    }
}

function handleResizeEnd() {
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('touchmove', handleResizing);

    window.removeEventListener('mouseup', handleResizeEnd);
    window.removeEventListener('touchend', handleResizeEnd);
} */