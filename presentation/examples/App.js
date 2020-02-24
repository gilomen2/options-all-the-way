export const App = ({ menuItems }) => {
  return (
    <div className='App'>
      <div className='menu'>
        {menuItems.map(item => <MenuItem
          key={item.id}
          item={item} />)}
      </div>
    </div>
  )
}

const MenuItem = ({ item }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))

  const handleSetSelections = newOptionGroupSelections => {
    const newSelections = currentSelections.map(opt => {
      if (opt.id === newOptionGroupSelections.id) {
        return newOptionGroupSelections
      }
      return opt
    })

    setCurrentSelections(newSelections)
  }

  return (
    <div>
      <span className='item-name'>{item.name}</span>
      {item.option_groups.map(optionGroup =>
        <OptionGroup
          key={optionGroup.id}
          optionGroup={optionGroup}
          currentOptionGroupSelections={pickSelectionsForOptionGroup(optionGroup, currentSelections)}
          onChange={handleSetSelections}
        />)}
    </div>
  )
}

const OptionGroup = ({ optionGroup, currentOptionGroupSelections, onChange }) => {
  const {
    options: currentOptionGroupSelectedOptions = []
  } = currentOptionGroupSelections

  const isRadioGroup = optionGroup.min_selectable === 1 && optionGroup.max_selectable === 1

  const createNewOptionGroupSelections = (e, changedOption) => {
    const newOptionGroup = { ...optionGroup }
    const newChangedOption = { ...changedOption }

    if (e.target.checked) {
      newChangedOption.option_groups = getDefaultSelectedItemOptions(newChangedOption.option_groups)
    }

    newOptionGroup.options = isRadioGroup
      ? [newChangedOption]
      : e.target.checked
        ? [...currentOptionGroupSelectedOptions, newChangedOption]
        : currentOptionGroupSelectedOptions.filter(opt => opt.id !== changedOption.id)

    onChange(newOptionGroup)
  }

  const createNewParentSelections = (optionId, parentOptionSelections) => changedOptionGroup => {
    const newParentOptionSelections = parentOptionSelections.map(opt => {
      const newOpt = { ...opt }
      if (newOpt.id === optionId) {
        newOpt.option_groups = newOpt.option_groups.map(og => {
          let newOptionGroup = { ...og }
          if (newOptionGroup.id === changedOptionGroup.id) {
            newOptionGroup = changedOptionGroup
          }
          return newOptionGroup
        })
      }
      return newOpt
    })

    const newSelections = { ...currentOptionGroupSelections }
    newSelections.options = newParentOptionSelections

    onChange(newSelections)
  }

  return (
    <div className={'option-group'}>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>
        {optionGroup.options.map(option => {
          const isSelected = !!currentOptionGroupSelectedOptions.find(opt => option.id === opt.id)
          return (
            <>
              <div key={option.id} className='option'>
                <input type={isRadioGroup ? 'radio' : 'checkbox'}
                  name={optionGroup.id}
                  id={option.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={e => createNewOptionGroupSelections(e, option)}
                />
                <label htmlFor={option.id}>{option.name}</label>
              </div>

              <div>
                {option.option_groups.map(nestedOptionGroup => {
                  const selOpts = currentOptionGroupSelectedOptions.find(sel => sel.id === option.id)
                  return (
                    <OptionGroup
                      key={nestedOptionGroup.id}
                      optionGroup={nestedOptionGroup}
                      currentOptionGroupSelections={selOpts ? pickSelectionsForOptionGroup(nestedOptionGroup, selOpts.option_groups) : []}
                      onChange={createNewParentSelections(option.id, currentOptionGroupSelectedOptions)}
                    />)
                })}
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}
