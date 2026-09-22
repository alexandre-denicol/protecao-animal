import Link from 'next/link'
import {
  StateActions,
  StateHeading,
  StateIcon,
  StatePanel,
  StateText,
  statePrimaryLinkClass,
  stateTextLinkClass,
} from '@/components/public/StatePanel'

export function AdoptionStoriesEmpty() {
  return (
    <StatePanel
      testId="adoption-stories-empty"
      icon={
        <StateIcon>
          <path d="M12 20.5C12 20.5 4 15.6 4 9.9C4 7.2 6 5.2 8.4 5.2C10 5.2 11.3 6 12 7.3C12.7 6 14 5.2 15.6 5.2C18 5.2 20 7.2 20 9.9C20 15.6 12 20.5 12 20.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </StateIcon>
      }
    >
      <StateHeading>Ainda não há histórias publicadas</StateHeading>
      <StateText>
        Quando a equipe registrar novas adoções, elas aparecem aqui. Enquanto isso,
        conheça os animais que esperam por um lar.
      </StateText>
      <StateActions>
        <Link href="/animais" className={statePrimaryLinkClass}>
          Ver animais para adoção
        </Link>
        <Link href="/contato" className={stateTextLinkClass}>
          Falar com a equipe
        </Link>
      </StateActions>
    </StatePanel>
  )
}

export function AdoptionStoriesFailure() {
  return (
    <StatePanel
      testId="adoption-stories-error"
      role="alert"
      icon={
        <StateIcon tone="alert">
          <path d="M12 8V13M12 16.5V16.51" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.3 4.6L3.4 16.6C2.7 17.8 3.6 19.3 5 19.3H19C20.4 19.3 21.3 17.8 20.6 16.6L13.7 4.6C13 3.4 11 3.4 10.3 4.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </StateIcon>
      }
    >
      <StateHeading>Não foi possível carregar as histórias</StateHeading>
      <StateText>
        Tivemos um problema ao buscar as histórias agora. Tente novamente em instantes;
        se continuar, fale com a equipe.
      </StateText>
      <StateActions>
        {/* <a> de propósito: força uma nova requisição ao servidor */}
        <a href="/adocoes" className={statePrimaryLinkClass}>
          Tentar novamente
        </a>
        <Link href="/animais" className={stateTextLinkClass}>
          Ver animais para adoção
        </Link>
      </StateActions>
    </StatePanel>
  )
}
