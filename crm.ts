// using Microsoft.Xrm.Sdk;
// using System;

// namespace MyDataversePlugins
// {
//     public class CreateRecordOnDeletePlugin : IPlugin
//     {
//         public void Execute(IServiceProvider serviceProvider)
//         {
//             // Obtain the tracing service
//             ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

//             // Obtain the execution context from the service provider
//             IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

//             // Obtain the Organization Service factory
//             IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

//             // Obtain the Organization Service
//             IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

//             // Check if the plugin is executing on the Delete message and in the Post-operation stage
//             if (context.MessageName.ToLower() == "delete" && context.Stage == (int)PluginStage.PostOperation)
//             {
//                 // Verify that the target is an EntityReference (for delete operations)
//                 if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is EntityReference deletedEntityRef)
//                 {
//                     try
//                     {
//                         // Retrieve the deleted record's details (optional, but often needed)
//                         // This requires retrieving the record in the Pre-Operation stage if you need its full attributes before deletion.
//                         // For this example, we'll assume we only need the ID and logical name.
//                         Guid deletedRecordId = deletedEntityRef.Id;
//                         string deletedEntityLogicalName = deletedEntityRef.LogicalName;

//                         tracingService.Trace($"Deleted {deletedEntityLogicalName} with ID: {deletedRecordId}");

//                         // Create a new record in a different entity (e.g., an "Audit Log" entity)
//                         Entity newAuditLog = new Entity("new_auditlog"); // Replace "new_auditlog" with your target entity's logical name
//                         newAuditLog["new_name"] = $"Record deleted: {deletedEntityLogicalName} - {deletedRecordId}"; // Set appropriate fields
//                         newAuditLog["new_deletedentityid"] = deletedRecordId.ToString(); // Store the ID of the deleted record

//                         service.Create(newAuditLog);

//                         tracingService.Trace($"Created new audit log record for deleted {deletedEntityLogicalName}.");
//                     }
//                     catch (Exception ex)
//                     {
//                         tracingService.Trace($"An error occurred in CreateRecordOnDeletePlugin: {ex.ToString()}");
//                         throw new InvalidPluginExecutionException("An error occurred in the CreateRecordOnDeletePlugin.", ex);
//                     }
//                 }
//             }
//         }
//     }
// }