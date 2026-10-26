# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

## Development

Start the Spring Boot backend and then run the Angular development server:

```bash
npm start
```

Open `http://localhost:4200/`. The development server forwards `/api` requests to `http://localhost:8080` through `proxy.conf.json`; task and project data therefore requires the backend to be available.

## Using Trama

The task board supports:

- Creating, editing, completing, moving, and deleting tasks.
- Optional descriptions, priorities, due dates, and project assignment.
- Searching task titles and descriptions, and filtering by priority, status, or due date. **Clear filters** restores the full board.
- Dragging a task card to another status column. The arrow buttons remain available as a keyboard-friendly alternative.
- Exporting currently visible (filtered) tasks as a UTF-8 CSV file. Values are escaped for CSV and spreadsheet-formula prefixes are neutralized.
- A progress summary, overdue count, due-today/overdue labels, and project completion counts calculated from real task lists.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `N` | Focus the new-task title field |
| `/` | Focus task search |
| `Ctrl` + `Shift` + `E` | Export visible tasks to CSV |
| `Escape` | Close the task editor |

Focus shortcuts are ignored while typing in an input, select, textarea, or editable element. The theme button in the top bar switches between light and dark themes; the selection is saved in browser local storage.

### Motion and accessibility

Short page/card entrance transitions, a restrained perspective lift on hover, and drop-target feedback add visual motion without an external animation or WebGL dependency. The `prefers-reduced-motion: reduce` media preference disables nonessential movement and transitions. Drag-and-drop is an enhancement, not the only way to change a task's status: labeled completion and move buttons are also provided.

## Frontend structure

- `src/app/app.*`: application shell, navigation, theme switch, and router outlet.
- `src/app/core/models/`: shared TypeScript models for tasks and projects.
- `src/app/core/services/`: HTTP services that communicate with the backend.
- `src/app/core/utils/`: shared date and due-date helpers.
- `src/app/tablero/`: task board, filters, keyboard shortcuts, CSV export, and drag-and-drop.
- `src/app/proyectos/`: project list and project task details.
- `src/app/shared/tarea-editor/`: reusable task editing dialog.
- `src/styles.css`: design tokens, themes, responsive UI primitives, and motion preferences.

## Build and tests

```bash
npm run build
npm test -- --watch=false
```

Run backend tests from the repository root with `backend\mvnw.cmd clean test`.

## Code scaffolding

To generate a new component:

```bash
ng generate component component-name
```

For more information about Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
