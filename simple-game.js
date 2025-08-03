// Simple test game
console.log('🚀 SIMPLE GAME STARTING...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM LOADED');
    
    // Find the direct start button
    const directBtn = document.getElementById('directStartBtn');
    if (directBtn) {
        console.log('✅ Direct button found');
        directBtn.onclick = () => {
            console.log('🔴 DIRECT BUTTON CLICKED!');
            
            // Get canvas
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                alert('Canvas not found!');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                alert('Context not found!');
                return;
            }
            
            // Hide all screens
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';
            
            // Draw something simple
            ctx.fillStyle = 'blue';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'red';
            ctx.fillRect(100, 100, 50, 50);
            
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.fillText('GAME STARTED!', 200, 200);
            
            alert('Simple game started! You should see a blue canvas with red square.');
        };
    } else {
        console.error('❌ Direct button not found!');
    }
});

console.log('🏁 SIMPLE GAME SCRIPT LOADED!');
