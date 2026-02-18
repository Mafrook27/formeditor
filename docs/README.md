# Form Editor Documentation

## 📖 Documentation Index

### Quick Access
- **[Quick Reference Card](QUICK-REFERENCE.md)** - Keep this open while coding!
- **[Project Guide](PROJECT-GUIDE.md)** - Comprehensive project overview

### For Developers
- **[Project Guide](PROJECT-GUIDE.md)** - Architecture, common tasks, troubleshooting
- **[Quick Reference](QUICK-REFERENCE.md)** - Critical rules and common patterns

### For AI Assistants
These files are automatically included in AI interactions:
- **`.kiro/steering/react-performance-rules.md`** - React optimization rules
- **`.kiro/steering/project-architecture.md`** - Architecture details
- **`.kiro/steering/code-modification-guidelines.md`** - Modification guidelines

### Bug Reports & Fixes
- **[Memo Re-render Bug Fix](BUGFIX-MEMO-RERENDER.md)** - Feb 18, 2026
- **[Maintenance Summary](SUMMARY-2026-02-18.md)** - Complete session summary

## 🎯 Where to Start

### New to the Project?
1. Read [Project Guide](PROJECT-GUIDE.md)
2. Review [Quick Reference](QUICK-REFERENCE.md)
3. Check steering files in `.kiro/steering/`

### Making Changes?
1. Review [Code Modification Guidelines](../.kiro/steering/code-modification-guidelines.md)
2. Check [React Performance Rules](../.kiro/steering/react-performance-rules.md)
3. Use [Quick Reference](QUICK-REFERENCE.md) while coding
4. Follow testing checklist

### Debugging Issues?
1. Check [Quick Reference](QUICK-REFERENCE.md) for quick fixes
2. Review [Project Guide](PROJECT-GUIDE.md) troubleshooting section
3. Read relevant bug reports for similar issues

## 📚 Documentation Structure

```
docs/
├── README.md (this file)
├── QUICK-REFERENCE.md          # Quick reference card
├── PROJECT-GUIDE.md            # Comprehensive guide
├── BUGFIX-MEMO-RERENDER.md     # Bug report
└── SUMMARY-2026-02-18.md       # Maintenance summary

.kiro/steering/
├── react-performance-rules.md          # React optimization
├── project-architecture.md             # Architecture details
└── code-modification-guidelines.md     # Modification rules
```

## 🔑 Key Concepts

### State Management
- Context + Reducer pattern
- Immutable updates (always create new objects)
- Undo/redo via history snapshots

### Component Optimization
- React.memo with DEFAULT comparison
- Never use custom comparison functions
- Immutable updates enable efficient re-renders

### Testing
- Manual testing checklist after every change
- Verify inspector updates work in real-time
- Check preview mode, undo/redo, drag and drop

## ⚠️ Critical Rules

1. **Never mutate state directly** - Always create new objects
2. **Never use custom memo comparisons** - Use default comparison
3. **Always test after changes** - Follow the testing checklist
4. **Handle preview mode** - Hide edit UI in preview
5. **Push history for user actions** - Enable undo/redo

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 📞 Getting Help

1. Check documentation in this folder
2. Review steering files in `.kiro/steering/`
3. Use React DevTools for debugging
4. Check browser console for errors

## 🎯 Project Goals

- **Maintainability** - Easy to understand and modify
- **Performance** - Efficient re-renders, smooth UX
- **Reliability** - Predictable behavior
- **Documentation** - Comprehensive and up-to-date

## 📝 Contributing

Before making changes:
1. Read relevant documentation
2. Follow established patterns
3. Test thoroughly
4. Update documentation if needed

## 🔄 Keeping Documentation Updated

When making significant changes:
1. Update relevant steering files
2. Add bug reports for fixes
3. Update PROJECT-GUIDE.md if architecture changes
4. Keep QUICK-REFERENCE.md current

## 📊 Documentation Status

| File | Status | Last Updated |
|------|--------|--------------|
| QUICK-REFERENCE.md | ✅ Current | 2026-02-18 |
| PROJECT-GUIDE.md | ✅ Current | 2026-02-18 |
| BUGFIX-MEMO-RERENDER.md | ✅ Current | 2026-02-18 |
| react-performance-rules.md | ✅ Current | 2026-02-18 |
| project-architecture.md | ✅ Current | 2026-02-18 |
| code-modification-guidelines.md | ✅ Current | 2026-02-18 |

---

**Last Updated:** February 18, 2026
**Maintained By:** Development Team
**Status:** ✅ Complete and Current
