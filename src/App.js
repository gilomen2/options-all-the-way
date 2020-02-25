import React, { useEffect, useState } from 'react'
import './App.scss'
import { items } from './sample-data'
import {
  formatOptionGroupForSelections,
  getDefaultSelectedItemOptions,
  pickSelectionsForOptionGroup
} from './helpers'
import classNames from 'classnames'
import Expand from 'react-expand-animated'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { oceanNext } from './oceanNext'

export const App = ({ showSnippet = true }) => {
  const [openItem, setOpenItem] = useState(null)
  const [currentCodeSnippet, setCurrentCodeSnippet] = useState(null)

  const toggleExpanded = itemId => {
    setOpenItem(itemId)
  }

  return (
    <div className='App'>
      <div className='menu'>
        {items.map(item => <MenuItem
          expandItem={toggleExpanded}
          setCurrentCodeSnippet={setCurrentCodeSnippet}
          expanded={openItem === item.id}
          key={item.id}
          item={item} />)}
      </div>
      {showSnippet && currentCodeSnippet && <div className='code-snippet'>
        <code>
          <pre>
            <SyntaxHighlighter style={oceanNext}>
              {JSON.stringify(currentCodeSnippet, null, 2)}
            </SyntaxHighlighter>
          </pre>
        </code>
      </div>}
    </div>
  )
}

const MenuItem = ({ item, expanded, expandItem, setCurrentCodeSnippet }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))

  useEffect(() => {
    if (expanded) {
      setCurrentCodeSnippet(currentSelections)
    }
  }, [expanded, currentSelections])

  const handleSetSelections = newOptionGroupSelections => {
    // Create a new array from the currentSelections with the changed optionGroup replacing the matching one from the
    // current selections
    const newSelections = currentSelections.map(opt => {
      if (opt.id === newOptionGroupSelections.id) {
        return newOptionGroupSelections
      }
      return opt
    })

    // Update the state to replace the new selections
    setCurrentSelections(newSelections)
  }

  return (
    <div onClick={() => expandItem(item.id)}>
      <span className='item-name'>{item.name}</span>
      <Expand open={expanded}>
        {item.option_groups.map(optionGroup =>
          <OptionGroup
            nested={false}
            key={optionGroup.id}
            onChange={handleSetSelections}
            // The state of what is selected for the option group
            currentOptionGroupSelections={pickSelectionsForOptionGroup(optionGroup, currentSelections)}
            // The full option group data for what should be displayed
            optionGroup={optionGroup} />)}
      </Expand>
    </div>
  )
}

const OptionGroup = ({ optionGroup, currentOptionGroupSelections, onChange, nested = true }) => {
  const {
    options: currentOptionGroupSelectedOptions = []
  } = currentOptionGroupSelections

  const isRadio = optionGroup.min_selectable === 1 && optionGroup.max_selectable === 1

  const createNewOptionGroupSelections = (e, changedOption) => {
    debugger
    const newOptionGroup = { ...formatOptionGroupForSelections(optionGroup) }
    const newChangedOption = { ...changedOption }

    // If the changed option is selected, we get the default selections for it's option_groups so that we can show them
    // as selected as well
    if (e.target.checked) {
      newChangedOption.option_groups = getDefaultSelectedItemOptions(newChangedOption.option_groups)
    }

    newOptionGroup.options = isRadio
      // If it's a radio button, we can replace the current selection with the new selection
      ? [newChangedOption]
      // If it's a checkbox, we first determine if the change is that it has become checked or unchecked
      : e.target.checked
        // If it is checked, we add the new selection to the current selections
        ? [...currentOptionGroupSelectedOptions, newChangedOption]
        // If it isn't checked, we filter the current selections to only those that don't match the id of the changed option
        : currentOptionGroupSelectedOptions.filter(opt => opt.id !== changedOption.id)

    // We finally pass the newOptionGroup to the onChange handler
    onChange(newOptionGroup)
  }

  const createNewParentSelections = (optionId, parentOptionSelections) => changedOptionGroup => {
    debugger
    const newParentOptionSelections = parentOptionSelections.map(opt => {
      const newOpt = { ...opt }
      if (newOpt.id === optionId) {
        newOpt.option_groups = newOpt.option_groups.map(og => {
          let newOptionGroup = { ...formatOptionGroupForSelections(og) }
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
    <div className={classNames('option-group', nested && 'nested')}>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>

        {optionGroup.options.map(option => {
          const isSelected = !!currentOptionGroupSelectedOptions.find(opt => option.id === opt.id)
          return (
            <div key={option.id} className='option'>
              <div className={classNames('pretty p-smooth', isRadio && 'p-round p-default', !isRadio && 'p-svg')}>
                <input type={isRadio ? 'radio' : 'checkbox'}
                  name={optionGroup.id}
                  id={option.id}
                  value={option.id}
                  onChange={e => createNewOptionGroupSelections(e, option)}
                  checked={isSelected} />
                <div className='state p-default'>
                  {!isRadio && <Check />}
                  <label className={classNames(isSelected && 'selected')} htmlFor={option.id}>{option.name}</label>
                </div>
              </div>

              <Expand open={isSelected}>
                <div>
                  {option.option_groups.map(nestedOptionGroup => {
                    const selOpts = currentOptionGroupSelectedOptions.find(sel => sel.id === option.id)
                    return (<OptionGroup
                      key={nestedOptionGroup.id}
                      onChange={createNewParentSelections(option.id, currentOptionGroupSelectedOptions)}
                      currentOptionGroupSelections={selOpts ? pickSelectionsForOptionGroup(nestedOptionGroup, selOpts.option_groups) : []}
                      optionGroup={nestedOptionGroup}/>)
                  })}
                </div>
              </Expand>
            </div>
          )
        })}
      </div>
    </div>

  )
}

const Check = () => {
  return (
    <svg className="svg svg-icon" viewBox="0 0 20 20">
      <path
        d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z">
      </path>
    </svg>)
}
