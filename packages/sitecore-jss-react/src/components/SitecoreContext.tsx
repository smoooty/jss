import React from 'react';

import PropTypes from 'prop-types';
import { ComponentFactory } from './sharedTypes';

export interface SitecoreContextProps {
  componentFactory: ComponentFactory;
  contextFactory?: SitecoreContextFactory;
  context?: any;
  [k: string]: any;
}

export class SitecoreContextFactory {
  subscriber: any;
  context: any;

  constructor() {
    this.context = {
      pageEditing: false,
    };
  }

  getSitecoreContext = () => {
    return this.context;
  }

  subscribeToContext = (func: any) => {
    this.subscriber = func;
  }

  unsubscribeFromContext = () => {
    this.subscriber = undefined;
  }

  setSitecoreContext = (value: any) => {
    this.context = value;
    this.subscriber(this);
  }
}

export const SitecoreContextReactContext = React.createContext<SitecoreContextFactory>({} as SitecoreContextFactory);
export const ComponentFactoryReactContext = React.createContext<ComponentFactory>({} as ComponentFactory);

export class SitecoreContext extends React.Component<SitecoreContextProps, { contextFactory: SitecoreContextFactory }> {
  static propTypes = {
    children: PropTypes.any.isRequired,
    componentFactory: PropTypes.func,
    contextFactory: PropTypes.object,
  };

  static displayName = 'SitecoreContext';

  componentFactory: ComponentFactory;

  constructor(props: SitecoreContextProps, context: any) {
    super(props, context);

    this.componentFactory = props.componentFactory;

    const contextFactory = this.props.contextFactory
      ? this.props.contextFactory
      : new SitecoreContextFactory();
    
    this.state = {
      contextFactory: { ...contextFactory }
    };

    // we force the children of the context to re-render when the context is updated
    // even if the local props are unchanged; we assume the contents depend on the Sitecore context
    this.state.contextFactory.subscribeToContext(this.updateFactory);
  }

  /**
   * React Context Provider should accept Object instead of
   * SitecoreContextFactory class instance
   */
  updateFactory = (updatedFactory: SitecoreContextFactory) => {
    this.setState({
      contextFactory: { ...updatedFactory }
    });
  }

  render() {
    return (
    <ComponentFactoryReactContext.Provider value={this.componentFactory}>
      <SitecoreContextReactContext.Provider value={this.state.contextFactory}>
        {this.props.children}
      </SitecoreContextReactContext.Provider>
    </ComponentFactoryReactContext.Provider>
    );
  }
}
