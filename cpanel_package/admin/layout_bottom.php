        </main>
    </div>

    <script>
        function toggleSubmenu(id) {
            const el = document.getElementById(id);
            const arrow = document.getElementById(id.replace('sub-', 'arrow-'));
            if (el) {
                el.classList.toggle('hidden');
                if (arrow) arrow.classList.toggle('rotate-180');
            }
        }
    </script>
</body>
</html>
