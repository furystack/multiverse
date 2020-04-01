import { Shade, createComponent } from '@furystack/shades'

export const OrganizationDetailsPage = Shade<{ organizationId: string }>({
  shadowDomName: 'shade-organization-details-page',
  render: ({ props }) => {
    return (
      <div>
        Organization details for <strong>{props.organizationId}</strong>
      </div>
    )
  },
})
